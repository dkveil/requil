import { describe, expect, it } from 'vitest';
import {
	createWebhookSignature,
	generateNonce,
	signWebhook,
	timingSafeCompare,
	verifyWebhookSignature,
} from '../core/signer.js';
import type {
	DeliveredEventPayload,
	WebhookEventPayload,
} from '../types/index.js';

const HEX_PATTERN = /^[0-9a-f]{32}$/;

describe('Webhook Signer', () => {
	const testPayload: DeliveredEventPayload = {
		eventType: 'delivered',
		timestamp: Date.now(),
		messageId: 'msg-123',
		recipient: 'test@example.com',
		templateSnapshotId: 'tpl-snapshot-456',
		transport: 'resend',
		workspaceId: 'ws-789',
		traceId: 'trace-abc',
	};

	const secret = 'test-secret-key';

	describe('generateNonce', () => {
		it('should generate nonce of correct length', () => {
			const nonce = generateNonce();
			expect(nonce).toHaveLength(32);
		});

		it('should generate unique nonces', () => {
			const nonce1 = generateNonce();
			const nonce2 = generateNonce();
			expect(nonce1).not.toBe(nonce2);
		});

		it('should generate hex string', () => {
			const nonce = generateNonce();
			expect(nonce).toMatch(HEX_PATTERN);
		});
	});

	describe('createWebhookSignature', () => {
		it('should create consistent signatures for same input', () => {
			const payload = JSON.stringify(testPayload);
			const timestamp = Date.now();
			const nonce = 'test-nonce';

			const signature1 = createWebhookSignature(
				payload,
				timestamp,
				nonce,
				secret
			);
			const signature2 = createWebhookSignature(
				payload,
				timestamp,
				nonce,
				secret
			);

			expect(signature1).toBe(signature2);
		});

		it('should create different signatures for different payloads', () => {
			const timestamp = Date.now();
			const nonce = 'test-nonce';

			const signature1 = createWebhookSignature(
				JSON.stringify({ data: 'test1' }),
				timestamp,
				nonce,
				secret
			);
			const signature2 = createWebhookSignature(
				JSON.stringify({ data: 'test2' }),
				timestamp,
				nonce,
				secret
			);

			expect(signature1).not.toBe(signature2);
		});

		it('should create different signatures for different timestamps', () => {
			const payload = JSON.stringify(testPayload);
			const nonce = 'test-nonce';

			const signature1 = createWebhookSignature(
				payload,
				Date.now(),
				nonce,
				secret
			);
			const signature2 = createWebhookSignature(
				payload,
				Date.now() + 1000,
				nonce,
				secret
			);

			expect(signature1).not.toBe(signature2);
		});

		it('should create different signatures for different nonces', () => {
			const payload = JSON.stringify(testPayload);
			const timestamp = Date.now();

			const signature1 = createWebhookSignature(
				payload,
				timestamp,
				'nonce-1',
				secret
			);
			const signature2 = createWebhookSignature(
				payload,
				timestamp,
				'nonce-2',
				secret
			);

			expect(signature1).not.toBe(signature2);
		});

		it('should create different signatures for different secrets', () => {
			const payload = JSON.stringify(testPayload);
			const timestamp = Date.now();
			const nonce = 'test-nonce';

			const signature1 = createWebhookSignature(
				payload,
				timestamp,
				nonce,
				'secret-1'
			);
			const signature2 = createWebhookSignature(
				payload,
				timestamp,
				nonce,
				'secret-2'
			);

			expect(signature1).not.toBe(signature2);
		});
	});

	describe('signWebhook', () => {
		it('should sign webhook with default timestamp and nonce', () => {
			const result = signWebhook({
				payload: testPayload,
				secret,
			});

			expect(result.signature).toBeTruthy();
			expect(result.timestamp).toBeGreaterThan(0);
			expect(result.nonce).toHaveLength(32);
		});

		it('should sign webhook with custom timestamp', () => {
			const customTimestamp = 1234567890000;
			const result = signWebhook({
				payload: testPayload,
				secret,
				timestamp: customTimestamp,
			});

			expect(result.timestamp).toBe(customTimestamp);
		});

		it('should sign webhook with custom nonce', () => {
			const customNonce = 'custom-nonce-12345';
			const result = signWebhook({
				payload: testPayload,
				secret,
				nonce: customNonce,
			});

			expect(result.nonce).toBe(customNonce);
		});

		it('should handle string payload', () => {
			const payloadString = JSON.stringify(testPayload);
			const result = signWebhook({
				payload: payloadString as unknown as WebhookEventPayload,
				secret,
			});

			expect(result.signature).toBeTruthy();
		});

		it('should create reproducible signatures', () => {
			const timestamp = Date.now();
			const nonce = 'fixed-nonce';

			const result1 = signWebhook({
				payload: testPayload,
				secret,
				timestamp,
				nonce,
			});

			const result2 = signWebhook({
				payload: testPayload,
				secret,
				timestamp,
				nonce,
			});

			expect(result1.signature).toBe(result2.signature);
		});
	});

	describe('verifyWebhookSignature', () => {
		it('should verify valid signature', () => {
			const timestamp = Date.now();
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);
			const signature = createWebhookSignature(
				payloadString,
				timestamp,
				nonce,
				secret
			);

			const result = verifyWebhookSignature({
				payload: payloadString,
				signature,
				secret,
				timestamp,
				nonce,
			});

			expect(result.valid).toBe(true);
			expect(result.payload).toEqual(testPayload);
		});

		it('should reject invalid signature', () => {
			const timestamp = Date.now();
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);

			const result = verifyWebhookSignature({
				payload: payloadString,
				signature: 'invalid-signature',
				secret,
				timestamp,
				nonce,
			});

			expect(result.valid).toBe(false);
			expect(result.reason).toBe('Invalid signature');
		});

		it('should reject expired signature', () => {
			const oldTimestamp = Date.now() - 10 * 60 * 1000;
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);
			const signature = createWebhookSignature(
				payloadString,
				oldTimestamp,
				nonce,
				secret
			);

			const result = verifyWebhookSignature({
				payload: payloadString,
				signature,
				secret,
				timestamp: oldTimestamp,
				nonce,
				maxAgeMs: 5 * 60 * 1000,
			});

			expect(result.valid).toBe(false);
			expect(result.reason).toContain('Timestamp too old');
		});

		it('should reject future timestamp', () => {
			const futureTimestamp = Date.now() + 10 * 60 * 1000;
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);
			const signature = createWebhookSignature(
				payloadString,
				futureTimestamp,
				nonce,
				secret
			);

			const result = verifyWebhookSignature({
				payload: payloadString,
				signature,
				secret,
				timestamp: futureTimestamp,
				nonce,
			});

			expect(result.valid).toBe(false);
			expect(result.reason).toBe('Timestamp is in the future');
		});

		it('should handle custom maxAgeMs', () => {
			const timestamp = Date.now() - 2000;
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);
			const signature = createWebhookSignature(
				payloadString,
				timestamp,
				nonce,
				secret
			);

			const result = verifyWebhookSignature({
				payload: payloadString,
				signature,
				secret,
				timestamp,
				nonce,
				maxAgeMs: 1000,
			});

			expect(result.valid).toBe(false);
		});

		it('should verify payload object directly', () => {
			const timestamp = Date.now();
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);
			const signature = createWebhookSignature(
				payloadString,
				timestamp,
				nonce,
				secret
			);

			const result = verifyWebhookSignature({
				payload: testPayload,
				signature,
				secret,
				timestamp,
				nonce,
			});

			expect(result.valid).toBe(true);
			expect(result.payload).toEqual(testPayload);
		});

		it('should reject invalid JSON', () => {
			const timestamp = Date.now();
			const nonce = generateNonce();
			const invalidPayload = '{invalid json}';
			const signature = createWebhookSignature(
				invalidPayload,
				timestamp,
				nonce,
				secret
			);

			const result = verifyWebhookSignature({
				payload: invalidPayload,
				signature,
				secret,
				timestamp,
				nonce,
			});

			expect(result.valid).toBe(false);
			expect(result.reason).toBe('Invalid JSON payload');
		});

		it('should reject signature with wrong secret', () => {
			const timestamp = Date.now();
			const nonce = generateNonce();
			const payloadString = JSON.stringify(testPayload);
			const signature = createWebhookSignature(
				payloadString,
				timestamp,
				nonce,
				'wrong-secret'
			);

			const result = verifyWebhookSignature({
				payload: payloadString,
				signature,
				secret,
				timestamp,
				nonce,
			});

			expect(result.valid).toBe(false);
			expect(result.reason).toBe('Invalid signature');
		});
	});

	describe('timingSafeCompare', () => {
		it('should return true for equal strings', () => {
			const str1 = 'test-string-123';
			const str2 = 'test-string-123';
			expect(timingSafeCompare(str1, str2)).toBe(true);
		});

		it('should return false for different strings', () => {
			const str1 = 'test-string-123';
			const str2 = 'test-string-456';
			expect(timingSafeCompare(str1, str2)).toBe(false);
		});

		it('should return false for strings of different length', () => {
			const str1 = 'short';
			const str2 = 'longer-string';
			expect(timingSafeCompare(str1, str2)).toBe(false);
		});

		it('should handle empty strings', () => {
			expect(timingSafeCompare('', '')).toBe(true);
		});
	});

	describe('integration test', () => {
		it('should sign and verify webhook end-to-end', () => {
			const signResult = signWebhook({
				payload: testPayload,
				secret,
			});

			const verifyResult = verifyWebhookSignature({
				payload: testPayload,
				signature: signResult.signature,
				secret,
				timestamp: signResult.timestamp,
				nonce: signResult.nonce,
			});

			expect(verifyResult.valid).toBe(true);
			expect(verifyResult.payload).toEqual(testPayload);
		});

		it('should handle all event types', () => {
			const eventTypes: WebhookEventPayload[] = [
				{
					eventType: 'delivered',
					timestamp: Date.now(),
					messageId: 'msg-1',
					recipient: 'user1@example.com',
					templateSnapshotId: 'tpl-1',
					transport: 'resend',
					workspaceId: 'ws-1',
					traceId: 'trace-1',
				},
				{
					eventType: 'opened',
					timestamp: Date.now(),
					messageId: 'msg-2',
					recipient: 'user2@example.com',
					templateSnapshotId: 'tpl-2',
					transport: 'smtp',
					workspaceId: 'ws-2',
					traceId: 'trace-2',
					userAgent: 'Mozilla/5.0',
					ipAddress: '192.168.1.1',
				},
				{
					eventType: 'clicked',
					timestamp: Date.now(),
					messageId: 'msg-3',
					recipient: 'user3@example.com',
					templateSnapshotId: 'tpl-3',
					transport: 'resend',
					workspaceId: 'ws-3',
					traceId: 'trace-3',
					url: 'https://example.com/link',
					userAgent: 'Mozilla/5.0',
					ipAddress: '192.168.1.2',
				},
				{
					eventType: 'bounced',
					timestamp: Date.now(),
					messageId: 'msg-4',
					recipient: 'user4@example.com',
					templateSnapshotId: 'tpl-4',
					transport: 'smtp',
					workspaceId: 'ws-4',
					traceId: 'trace-4',
					bounceType: 'hard',
					reason: 'User not found',
					code: '550',
				},
			];

			for (const payload of eventTypes) {
				const signResult = signWebhook({ payload, secret });
				const verifyResult = verifyWebhookSignature({
					payload,
					signature: signResult.signature,
					secret,
					timestamp: signResult.timestamp,
					nonce: signResult.nonce,
				});

				expect(verifyResult.valid).toBe(true);
				expect(verifyResult.payload).toEqual(payload);
			}
		});
	});
});
