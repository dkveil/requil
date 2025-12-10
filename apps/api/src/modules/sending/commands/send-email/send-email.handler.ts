import { createHash } from 'node:crypto';
import { renderDocumentToHtml } from '@requil/email-engine';
import type {
	Document,
	SendEmailInput,
	SendEmailResponse,
} from '@requil/types';
import Ajv from 'ajv';
import { env } from '@/config';
import type { Action } from '@/shared/cqrs/bus.types';
import { sendingActionCreator } from '../..';
import {
	TemplateNotFoundError,
	VariableValidationError,
} from '../../domain/sending.error';

export const sendEmailAction =
	sendingActionCreator<SendEmailInput>('SEND_EMAIL');

export default function sendEmailHandler({
	commandBus,
	sendingRepository,
	templateRepository,
	redisService,
	transportService,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<SendEmailInput>
	): Promise<SendEmailResponse> => {
		const { payload, meta } = action;
		const workspaceId = meta?.workspaceId as string;
		const userId = meta?.userId as string;
		const idempotencyKey = meta?.idempotencyKey as string | undefined;
		const authMethod = meta?.authMethod as 'api_key' | 'session' | undefined;

		logger.info(
			{
				workspaceId,
				userId,
				template: payload.template,
				recipientCount: payload.to.length,
				hasIdempotencyKey: !!idempotencyKey,
				authMethod,
			},
			'Processing send email request'
		);

		if (!workspaceId) {
			throw new Error('Workspace ID is required');
		}

		if (idempotencyKey) {
			const idempotencyCheck =
				await redisService.idempotencyManager.check<SendEmailResponse>(
					idempotencyKey,
					payload
				);

			if (idempotencyCheck.isDuplicate && idempotencyCheck.cachedResult) {
				logger.info(
					{ idempotencyKey },
					'Returning cached result for idempotent request'
				);
				return idempotencyCheck.cachedResult;
			}

			const lockResult = await redisService.idempotencyManager.acquireLock(
				idempotencyKey,
				payload
			);

			if (!lockResult.acquired && lockResult.isDuplicate) {
				logger.info(
					{ idempotencyKey },
					'Request is being processed, checking for cached result'
				);

				await new Promise((resolve) => setTimeout(resolve, 100));

				const retryCheck =
					await redisService.idempotencyManager.check<SendEmailResponse>(
						idempotencyKey,
						payload
					);

				if (retryCheck.isDuplicate && retryCheck.cachedResult) {
					return retryCheck.cachedResult;
				}
			}
		}

		const template = await templateRepository.findByStableId(
			workspaceId,
			payload.template
		);

		if (!template) {
			throw new TemplateNotFoundError('Template not found', {
				template: payload.template,
				workspaceId,
			});
		}

		logger.info(
			{ templateId: template.id, stableId: payload.template },
			'Template found, validating and rendering'
		);

		if (!template.document) {
			throw new TemplateNotFoundError('Template has no document content', {
				template: payload.template,
				workspaceId,
			});
		}

		const templateData = template.toPersistence();
		const ajv = new Ajv({ allErrors: true });
		const variablesSchema = templateData.variablesSchema as Record<
			string,
			unknown
		> | null;

		for (const recipient of payload.to) {
			if (variablesSchema) {
				const validate = ajv.compile(variablesSchema);
				const valid = validate(recipient.variables || {});

				if (!valid) {
					throw new VariableValidationError(
						'Variable validation failed for recipient',
						{
							email: recipient.email,
							errors: validate.errors,
						}
					);
				}
			}
		}

		logger.info(
			{ recipientCount: payload.to.length },
			'Variables validated successfully'
		);

		const transportType = 'default' as const;

		logger.info({ transportType }, 'Transport configuration determined');

		const idempotencyKeyHash = idempotencyKey
			? createHash('sha256').update(idempotencyKey).digest()
			: createHash('sha256')
					.update(`${workspaceId}-${Date.now()}-${Math.random()}`)
					.digest();

		const jobId = crypto.randomUUID();
		const now = new Date().toISOString();

		const recipients = payload.to.map((recipient) => ({
			id: crypto.randomUUID(),
			jobId,
			workspaceId,
			email: recipient.email,
			variables: recipient.variables || null,
			variablesHmac: null,
			status: 'pending' as const,
			suppressedReason: null,
			errorCode: null,
			transportMessageId: null,
			attempts: 0,
			firstSentAt: null,
			lastAttemptAt: null,
		}));

		const job = {
			id: jobId,
			workspaceId,
			templateSnapshotId: template.id,
			transport: transportType,
			status: 'pending' as const,
			idempotencyKeyHash,
			createdBy: userId || null,
			createdAt: now,
		};

		await sendingRepository.createJobWithRecipients({
			job,
			recipients,
		});

		logger.info(
			{ jobId, recipientCount: recipients.length },
			'Send job created, starting email rendering'
		);

		let sentCount = 0;
		let failedCount = 0;
		const warnings: string[] = [];

		for (const recipient of recipients) {
			try {
				const renderResult = await renderDocumentToHtml(
					template.document as Document,
					{
						previewText: templateData.preheader || undefined,
						variables: recipient.variables || undefined,
					}
				);

				if (renderResult.errors.length > 0) {
					logger.error(
						{ recipientId: recipient.id, errors: renderResult.errors },
						'Rendering failed for recipient'
					);

					await sendingRepository.updateRecipientStatus({
						recipientId: recipient.id,
						status: 'failed',
						errorCode: 'RENDER_ERROR',
						attempts: 1,
						lastAttemptAt: new Date().toISOString(),
					});

					failedCount++;
					continue;
				}

				if (renderResult.warnings.length > 0) {
					warnings.push(
						`${recipient.email}: ${renderResult.warnings.join(', ')}`
					);
				}

				logger.info(
					{
						recipientId: recipient.id,
						email: recipient.email,
						htmlLength: renderResult.html.length,
					},
					'Email rendered successfully, sending via transport'
				);

				try {
					const transport = transportService.getTransport(transportType);

					const sendResult = await transport.send({
						from: { email: env.email.defaultFromEmail },
						to: [{ email: recipient.email }],
						subject: templateData.subjectLines?.[0] || 'Email from Requil',
						html: renderResult.html,
						plaintext: renderResult.plaintext,
					});

					logger.info(
						{
							recipientId: recipient.id,
							messageId: sendResult.messageId,
						},
						'Email sent successfully via transport'
					);

					await sendingRepository.updateRecipientStatus({
						recipientId: recipient.id,
						status: 'sent',
						transportMessageId: sendResult.messageId,
						attempts: 1,
						firstSentAt: new Date().toISOString(),
						lastAttemptAt: new Date().toISOString(),
					});

					sentCount++;
				} catch (transportError) {
					logger.error(
						{ recipientId: recipient.id, error: transportError },
						'Transport delivery failed'
					);

					await sendingRepository.updateRecipientStatus({
						recipientId: recipient.id,
						status: 'failed',
						errorCode: 'TRANSPORT_ERROR',
						attempts: 1,
						lastAttemptAt: new Date().toISOString(),
					});

					failedCount++;
				}
			} catch (error) {
				logger.error(
					{ recipientId: recipient.id, error },
					'Failed to process recipient'
				);

				await sendingRepository.updateRecipientStatus({
					recipientId: recipient.id,
					status: 'failed',
					errorCode: 'PROCESSING_ERROR',
					attempts: 1,
					lastAttemptAt: new Date().toISOString(),
				});

				failedCount++;
			}
		}

		await sendingRepository.updateJobStatus({
			jobId: job.id,
			status: failedCount === recipients.length ? 'failed' : 'completed',
		});

		logger.info(
			{ jobId, sent: sentCount, failed: failedCount },
			'Send job processing completed'
		);

		const response: SendEmailResponse = {
			ok: true,
			jobId: job.id,
			usedTemplateSnapshotId: template.id,
			sent: sentCount,
			failed: failedCount,
			warnings,
		};

		if (idempotencyKey) {
			const bodyHash = createHash('sha256')
				.update(JSON.stringify(payload))
				.digest('hex');

			await redisService.idempotencyManager.storeResult(
				idempotencyKey,
				response,
				bodyHash
			);

			logger.info({ idempotencyKey }, 'Stored result in idempotency cache');
		}

		return response;
	};

	const init = async () => {
		commandBus.register(sendEmailAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
