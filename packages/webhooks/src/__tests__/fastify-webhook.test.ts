import { Redis } from '@upstash/redis';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReplayProtection } from '../core/replay-protection.js';
import { signWebhook } from '../core/signer.js';
import { webhookPlugin } from '../middleware/fastify-webhook.js';
import type { DeliveredEventPayload } from '../types/index.js';

describe('Fastify Webhook Middleware', () => {
	let fastify: FastifyInstance;
	let redis: Redis;
	let replayProtection: ReplayProtection;
	const secret = 'test-webhook-secret';

	const testPayload: DeliveredEventPayload = {
		eventType: 'delivered',
		timestamp: Date.now(),
		messageId: 'msg-123',
		recipient: 'test@example.com',
		templateSnapshotId: 'tpl-456',
		transport: 'resend',
		workspaceId: 'ws-789',
		traceId: 'trace-abc',
	};

	beforeEach(async () => {
		fastify = Fastify({ logger: false });

		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
			token: process.env.UPSTASH_REDIS_REST_TOKEN || 'test-token',
		});

		replayProtection = new ReplayProtection({
			redis,
			prefix: 'test:webhook:verification',
			ttlSeconds: 300,
		});

		await fastify.register(webhookPlugin, {
			secret,
			maxAgeMs: 60000,
			replayProtection,
		});

		fastify.post('/webhook', async (request, reply) => {
			return reply.send({
				ok: true,
				payload: request.webhookPayload,
			});
		});

		await fastify.ready();
	});

	afterEach(async () => {
		await fastify.close();
	});

	describe('webhook verification', () => {
		it('should accept valid webhook with all headers', async () => {
			const signResult = signWebhook({
				payload: testPayload,
				secret,
			});

			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult.signature,
					'x-webhook-timestamp': signResult.timestamp.toString(),
					'x-webhook-nonce': signResult.nonce,
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.ok).toBe(true);
			expect(body.payload).toEqual(testPayload);

			await replayProtection.cleanup(signResult.nonce);
		});

		it('should reject request without signature header', async () => {
			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-timestamp': Date.now().toString(),
					'x-webhook-nonce': 'test-nonce',
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(400);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Bad Request');
		});

		it('should reject request without timestamp header', async () => {
			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': 'some-signature',
					'x-webhook-nonce': 'test-nonce',
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(400);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Bad Request');
		});

		it('should reject request without nonce header', async () => {
			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': 'some-signature',
					'x-webhook-timestamp': Date.now().toString(),
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(400);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Bad Request');
		});

		it('should reject request with invalid signature', async () => {
			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': 'invalid-signature',
					'x-webhook-timestamp': Date.now().toString(),
					'x-webhook-nonce': 'test-nonce',
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(401);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Unauthorized');
		});

		it('should reject request with invalid timestamp format', async () => {
			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': 'some-signature',
					'x-webhook-timestamp': 'not-a-number',
					'x-webhook-nonce': 'test-nonce',
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(400);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Bad Request');
		});

		it('should reject expired webhook', async () => {
			const oldTimestamp = Date.now() - 120000;
			const signResult = signWebhook({
				payload: testPayload,
				secret,
				timestamp: oldTimestamp,
			});

			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult.signature,
					'x-webhook-timestamp': oldTimestamp.toString(),
					'x-webhook-nonce': signResult.nonce,
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(401);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Unauthorized');
			expect(body.message).toContain('Timestamp too old');
		});

		it('should reject webhook with future timestamp', async () => {
			const futureTimestamp = Date.now() + 120000;
			const signResult = signWebhook({
				payload: testPayload,
				secret,
				timestamp: futureTimestamp,
			});

			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult.signature,
					'x-webhook-timestamp': futureTimestamp.toString(),
					'x-webhook-nonce': signResult.nonce,
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(401);
			const body = JSON.parse(response.body);
			expect(body.error).toBe('Unauthorized');
		});
	});

	describe('replay protection', () => {
		it('should reject replayed webhook', async () => {
			const signResult = signWebhook({
				payload: testPayload,
				secret,
			});

			const headers = {
				'x-webhook-signature': signResult.signature,
				'x-webhook-timestamp': signResult.timestamp.toString(),
				'x-webhook-nonce': signResult.nonce,
				'content-type': 'application/json',
			};

			const firstResponse = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers,
				payload: testPayload,
			});

			expect(firstResponse.statusCode).toBe(200);

			const replayResponse = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers,
				payload: testPayload,
			});

			expect(replayResponse.statusCode).toBe(409);
			const body = JSON.parse(replayResponse.body);
			expect(body.error).toBe('Conflict');
			expect(body.message).toBe('Webhook replay detected');

			await replayProtection.cleanup(signResult.nonce);
		});

		it('should allow different webhooks with different nonces', async () => {
			const signResult1 = signWebhook({
				payload: testPayload,
				secret,
			});

			const signResult2 = signWebhook({
				payload: { ...testPayload, messageId: 'msg-456' },
				secret,
			});

			const response1 = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult1.signature,
					'x-webhook-timestamp': signResult1.timestamp.toString(),
					'x-webhook-nonce': signResult1.nonce,
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			const response2 = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult2.signature,
					'x-webhook-timestamp': signResult2.timestamp.toString(),
					'x-webhook-nonce': signResult2.nonce,
					'content-type': 'application/json',
				},
				payload: { ...testPayload, messageId: 'msg-456' },
			});

			expect(response1.statusCode).toBe(200);
			expect(response2.statusCode).toBe(200);

			await replayProtection.cleanup(signResult1.nonce);
			await replayProtection.cleanup(signResult2.nonce);
		});
	});

	describe('payload handling', () => {
		it('should parse and attach webhook payload to request', async () => {
			const signResult = signWebhook({
				payload: testPayload,
				secret,
			});

			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult.signature,
					'x-webhook-timestamp': signResult.timestamp.toString(),
					'x-webhook-nonce': signResult.nonce,
					'content-type': 'application/json',
				},
				payload: testPayload,
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.payload).toEqual(testPayload);

			await replayProtection.cleanup(signResult.nonce);
		});

		it('should handle different event types', async () => {
			const clickedPayload = {
				eventType: 'clicked' as const,
				timestamp: Date.now(),
				messageId: 'msg-789',
				recipient: 'user@example.com',
				templateSnapshotId: 'tpl-789',
				transport: 'smtp' as const,
				workspaceId: 'ws-123',
				traceId: 'trace-xyz',
				url: 'https://example.com/link',
				userAgent: 'Mozilla/5.0',
			};

			const signResult = signWebhook({
				payload: clickedPayload,
				secret,
			});

			const response = await fastify.inject({
				method: 'POST',
				url: '/webhook',
				headers: {
					'x-webhook-signature': signResult.signature,
					'x-webhook-timestamp': signResult.timestamp.toString(),
					'x-webhook-nonce': signResult.nonce,
					'content-type': 'application/json',
				},
				payload: clickedPayload,
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.payload.eventType).toBe('clicked');
			expect(body.payload.url).toBe('https://example.com/link');

			await replayProtection.cleanup(signResult.nonce);
		});
	});

	describe('without replay protection', () => {
		let fastifyNoReplay: FastifyInstance;

		beforeEach(async () => {
			fastifyNoReplay = Fastify({ logger: false });

			await fastifyNoReplay.register(webhookPlugin, {
				secret,
				maxAgeMs: 60000,
			});

			fastifyNoReplay.post('/webhook', async (request, reply) => {
				return reply.send({
					ok: true,
					payload: request.webhookPayload,
				});
			});

			await fastifyNoReplay.ready();
		});

		afterEach(async () => {
			await fastifyNoReplay.close();
		});

		it('should allow duplicate nonces when replay protection disabled', async () => {
			const signResult = signWebhook({
				payload: testPayload,
				secret,
			});

			const headers = {
				'x-webhook-signature': signResult.signature,
				'x-webhook-timestamp': signResult.timestamp.toString(),
				'x-webhook-nonce': signResult.nonce,
				'content-type': 'application/json',
			};

			const response1 = await fastifyNoReplay.inject({
				method: 'POST',
				url: '/webhook',
				headers,
				payload: testPayload,
			});

			const response2 = await fastifyNoReplay.inject({
				method: 'POST',
				url: '/webhook',
				headers,
				payload: testPayload,
			});

			expect(response1.statusCode).toBe(200);
			expect(response2.statusCode).toBe(200);
		});
	});
});
