import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import type { ReplayProtection } from '../core/replay-protection';
import { verifyWebhookSignature } from '../core/signer';
import type { WebhookEventPayload } from '../types/index';

export interface WebhookPluginOptions {
	secret: string;
	maxAgeMs?: number;
	replayProtection?: ReplayProtection;
	extractHeaders?: (request: FastifyRequest) => {
		signature: string;
		timestamp: number;
		nonce: string;
	};
}

declare module 'fastify' {
	interface FastifyRequest {
		webhookPayload?: WebhookEventPayload;
	}
}

const DEFAULT_HEADER_EXTRACTOR = (request: FastifyRequest) => {
	const signature = request.headers['x-webhook-signature'] as string;
	const timestampHeader = request.headers['x-webhook-timestamp'] as string;
	const nonce = request.headers['x-webhook-nonce'] as string;

	if (!signature) {
		throw new Error('Missing required webhook headers');
	}
	if (!timestampHeader) {
		throw new Error('Missing required webhook headers');
	}
	if (!nonce) {
		throw new Error('Missing required webhook headers');
	}

	const timestamp = Number.parseInt(timestampHeader, 10);
	if (Number.isNaN(timestamp)) {
		throw new Error('Invalid timestamp header');
	}

	return { signature, timestamp, nonce };
};

const webhookVerificationPlugin: FastifyPluginAsync<
	WebhookPluginOptions
> = async (fastify, options) => {
	const extractHeaders = options.extractHeaders ?? DEFAULT_HEADER_EXTRACTOR;

	fastify.addHook('preHandler', async (request, reply) => {
		try {
			const { signature, timestamp, nonce } = extractHeaders(request);

			if (options.replayProtection) {
				const isNew = await options.replayProtection.checkAndMark(nonce);
				if (!isNew) {
					return reply.code(409).send({
						error: 'Conflict',
						message: 'Webhook replay detected',
					});
				}
			}

			const rawBody =
				typeof request.body === 'string'
					? request.body
					: JSON.stringify(request.body);

			const verificationResult = verifyWebhookSignature({
				payload: rawBody,
				signature,
				secret: options.secret,
				timestamp,
				nonce,
				maxAgeMs: options.maxAgeMs,
			});

			if (!verificationResult.valid) {
				return reply.code(401).send({
					error: 'Unauthorized',
					message: verificationResult.reason || 'Invalid webhook signature',
				});
			}

			request.webhookPayload = verificationResult.payload;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			return reply.code(400).send({
				error: 'Bad Request',
				message,
			});
		}
	});
};

export const webhookPlugin = fastifyPlugin(webhookVerificationPlugin, {
	name: '@requil/webhook-verification',
	fastify: '5.x',
});

export const verifyWebhookRequest = async (
	request: FastifyRequest,
	reply: FastifyReply,
	options: WebhookPluginOptions
): Promise<boolean> => {
	const extractHeaders = options.extractHeaders ?? DEFAULT_HEADER_EXTRACTOR;

	try {
		const { signature, timestamp, nonce } = extractHeaders(request);

		if (options.replayProtection) {
			const isNew = await options.replayProtection.checkAndMark(nonce);
			if (!isNew) {
				reply.code(409).send({
					error: 'Conflict',
					message: 'Webhook replay detected',
				});
				return false;
			}
		}

		const rawBody =
			typeof request.body === 'string'
				? request.body
				: JSON.stringify(request.body);

		const verificationResult = verifyWebhookSignature({
			payload: rawBody,
			signature,
			secret: options.secret,
			timestamp,
			nonce,
			maxAgeMs: options.maxAgeMs,
		});

		if (!verificationResult.valid) {
			reply.code(401).send({
				error: 'Unauthorized',
				message: verificationResult.reason || 'Invalid webhook signature',
			});
			return false;
		}

		request.webhookPayload = verificationResult.payload;
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		reply.code(400).send({
			error: 'Bad Request',
			message,
		});
		return false;
	}
};
