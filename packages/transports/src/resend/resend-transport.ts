import { TransportError } from '@requil/utils/errors';
import { Resend } from 'resend';
import { BaseTransport } from '../base-transport.js';
import type {
	EmailAddress,
	EmailAttachment,
	ResendConfig,
	SendEmailRequest,
	SendEmailResponse,
} from '../types.js';

export class ResendTransport extends BaseTransport {
	private client: Resend;

	constructor(config: ResendConfig) {
		super(config);
		this.client = new Resend(config.apiKey);
	}

	async send(request: SendEmailRequest): Promise<SendEmailResponse> {
		try {
			const response = await this.client.emails.send({
				from: this.formatEmail(request.from),
				to: request.to.map((addr: EmailAddress) => this.formatEmail(addr)),
				subject: request.subject,
				html: request.html,
				text: request.plaintext,
				replyTo: request.replyTo
					? this.formatEmail(request.replyTo)
					: undefined,
				headers: request.headers,
				attachments: request.attachments?.map((att: EmailAttachment) => ({
					filename: att.filename,
					content: att.content,
				})),
				tags: request.tags
					? Object.entries(request.tags).map(([name, value]) => ({
							name,
							value: String(value),
						}))
					: undefined,
			});

			if (response.error) {
				throw new TransportError(
					`Resend error: ${response.error.message}`,
					false,
					{
						traceId: this.config.traceId,
						provider: 'resend',
						error: response.error,
					}
				);
			}

			return {
				messageId: response.data?.id || '',
				accepted: request.to.map((addr: EmailAddress) => addr.email),
				transportMetadata: {
					provider: 'resend',
					resendId: response.data?.id,
				},
			};
		} catch (error) {
			if (error instanceof TransportError) {
				throw error;
			}

			throw new TransportError(
				error instanceof Error ? error.message : 'Unknown Resend error',
				true,
				{
					traceId: this.config.traceId,
					provider: 'resend',
					originalError: error,
				}
			);
		}
	}

	async verify(): Promise<boolean> {
		try {
			await this.client.apiKeys.list();
			return true;
		} catch {
			return false;
		}
	}
}
