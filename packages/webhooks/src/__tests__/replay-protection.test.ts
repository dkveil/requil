import { Redis } from '@upstash/redis';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReplayProtection } from '../core/replay-protection.js';

describe('ReplayProtection', () => {
	let redis: Redis;
	let replayProtection: ReplayProtection;

	beforeEach(() => {
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
			token: process.env.UPSTASH_REDIS_REST_TOKEN || 'test-token',
		});

		replayProtection = new ReplayProtection({
			redis,
			prefix: 'test:webhook:nonce',
			ttlSeconds: 300,
		});
	});

	afterEach(async () => {
		await replayProtection.cleanup('test-nonce-1');
		await replayProtection.cleanup('test-nonce-2');
		await replayProtection.cleanup('test-nonce-3');
	});

	describe('hasBeenUsed', () => {
		it('should return false for unused nonce', async () => {
			const result = await replayProtection.hasBeenUsed('test-nonce-1');
			expect(result).toBe(false);
		});

		it('should return true for used nonce', async () => {
			await replayProtection.markAsUsed('test-nonce-1');
			const result = await replayProtection.hasBeenUsed('test-nonce-1');
			expect(result).toBe(true);
		});
	});

	describe('markAsUsed', () => {
		it('should successfully mark unused nonce', async () => {
			const result = await replayProtection.markAsUsed('test-nonce-1');
			expect(result).toBe(true);
		});

		it('should return false when marking already used nonce', async () => {
			await replayProtection.markAsUsed('test-nonce-1');
			const result = await replayProtection.markAsUsed('test-nonce-1');
			expect(result).toBe(false);
		});

		it('should set TTL on nonce', async () => {
			await replayProtection.markAsUsed('test-nonce-1');

			const hasBeenUsed = await replayProtection.hasBeenUsed('test-nonce-1');
			expect(hasBeenUsed).toBe(true);
		});

		it('should isolate different nonces', async () => {
			const result1 = await replayProtection.markAsUsed('test-nonce-1');
			const result2 = await replayProtection.markAsUsed('test-nonce-2');

			expect(result1).toBe(true);
			expect(result2).toBe(true);

			const check1 = await replayProtection.hasBeenUsed('test-nonce-1');
			const check2 = await replayProtection.hasBeenUsed('test-nonce-2');

			expect(check1).toBe(true);
			expect(check2).toBe(true);
		});
	});

	describe('checkAndMark', () => {
		it('should return true for new nonce', async () => {
			const result = await replayProtection.checkAndMark('test-nonce-1');
			expect(result).toBe(true);
		});

		it('should return false for replay attempt', async () => {
			await replayProtection.checkAndMark('test-nonce-1');
			const result = await replayProtection.checkAndMark('test-nonce-1');
			expect(result).toBe(false);
		});

		it('should mark nonce as used after successful check', async () => {
			await replayProtection.checkAndMark('test-nonce-1');
			const hasBeenUsed = await replayProtection.hasBeenUsed('test-nonce-1');
			expect(hasBeenUsed).toBe(true);
		});

		it('should handle concurrent checks for same nonce', async () => {
			const promises = Array.from({ length: 10 }, () =>
				replayProtection.checkAndMark('test-nonce-1')
			);

			const results = await Promise.all(promises);
			const successCount = results.filter((r) => r === true).length;

			expect(successCount).toBeGreaterThanOrEqual(1);
			expect(successCount).toBeLessThanOrEqual(10);
		});

		it('should handle concurrent checks for different nonces', async () => {
			const promises = Array.from({ length: 5 }, (_, i) =>
				replayProtection.checkAndMark(`test-nonce-${i}`)
			);

			const results = await Promise.all(promises);
			const successCount = results.filter((r) => r === true).length;

			expect(successCount).toBe(5);

			for (let i = 0; i < 5; i++) {
				await replayProtection.cleanup(`test-nonce-${i}`);
			}
		});
	});

	describe('cleanup', () => {
		it('should remove nonce from Redis', async () => {
			await replayProtection.markAsUsed('test-nonce-1');
			await replayProtection.cleanup('test-nonce-1');

			const result = await replayProtection.hasBeenUsed('test-nonce-1');
			expect(result).toBe(false);
		});

		it('should allow re-use after cleanup', async () => {
			await replayProtection.markAsUsed('test-nonce-1');
			await replayProtection.cleanup('test-nonce-1');

			const result = await replayProtection.markAsUsed('test-nonce-1');
			expect(result).toBe(true);
		});

		it('should not affect other nonces', async () => {
			await replayProtection.markAsUsed('test-nonce-1');
			await replayProtection.markAsUsed('test-nonce-2');

			await replayProtection.cleanup('test-nonce-1');

			const check1 = await replayProtection.hasBeenUsed('test-nonce-1');
			const check2 = await replayProtection.hasBeenUsed('test-nonce-2');

			expect(check1).toBe(false);
			expect(check2).toBe(true);
		});
	});

	describe('configuration', () => {
		it('should use custom prefix', async () => {
			const customProtection = new ReplayProtection({
				redis,
				prefix: 'custom:prefix',
				ttlSeconds: 600,
			});

			const result = await customProtection.markAsUsed('test-nonce-1');
			expect(result).toBe(true);

			const hasBeenUsed = await customProtection.hasBeenUsed('test-nonce-1');
			expect(hasBeenUsed).toBe(true);

			await customProtection.cleanup('test-nonce-1');
		});

		it('should use default prefix when not provided', async () => {
			const defaultProtection = new ReplayProtection({
				redis,
			});

			const result = await defaultProtection.markAsUsed('test-nonce-1');
			expect(result).toBe(true);

			await defaultProtection.cleanup('test-nonce-1');
		});

		it('should use custom TTL', async () => {
			const shortTtlProtection = new ReplayProtection({
				redis,
				prefix: 'test:short-ttl',
				ttlSeconds: 1,
			});

			await shortTtlProtection.markAsUsed('test-nonce-1');
			const immediately = await shortTtlProtection.hasBeenUsed('test-nonce-1');
			expect(immediately).toBe(true);

			await new Promise((resolve) => setTimeout(resolve, 1500));

			const afterExpiry = await shortTtlProtection.hasBeenUsed('test-nonce-1');
			expect(afterExpiry).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty nonce', async () => {
			const result = await replayProtection.markAsUsed('');
			expect(result).toBe(true);

			const hasBeenUsed = await replayProtection.hasBeenUsed('');
			expect(hasBeenUsed).toBe(true);

			await replayProtection.cleanup('');
		});

		it('should handle very long nonce', async () => {
			const longNonce = 'a'.repeat(1000);
			const result = await replayProtection.markAsUsed(longNonce);
			expect(result).toBe(true);

			await replayProtection.cleanup(longNonce);
		});

		it('should handle special characters in nonce', async () => {
			const specialNonce = 'test:nonce-with-special_chars.123';
			const result = await replayProtection.markAsUsed(specialNonce);
			expect(result).toBe(true);

			await replayProtection.cleanup(specialNonce);
		});
	});

	describe('integration scenarios', () => {
		it('should prevent replay attack', async () => {
			const nonce = 'webhook-delivery-nonce-123';

			const firstAttempt = await replayProtection.checkAndMark(nonce);
			expect(firstAttempt).toBe(true);

			const replayAttempt = await replayProtection.checkAndMark(nonce);
			expect(replayAttempt).toBe(false);

			await replayProtection.cleanup(nonce);
		});

		it('should allow different webhooks with different nonces', async () => {
			const nonces = ['webhook-1-nonce', 'webhook-2-nonce', 'webhook-3-nonce'];

			for (const nonce of nonces) {
				const result = await replayProtection.checkAndMark(nonce);
				expect(result).toBe(true);
			}

			for (const nonce of nonces) {
				const replayAttempt = await replayProtection.checkAndMark(nonce);
				expect(replayAttempt).toBe(false);
			}

			for (const nonce of nonces) {
				await replayProtection.cleanup(nonce);
			}
		});

		it('should handle rapid sequential requests', async () => {
			const nonces = Array.from({ length: 10 }, (_, i) => `nonce-${i}`);

			for (const nonce of nonces) {
				const result = await replayProtection.checkAndMark(nonce);
				expect(result).toBe(true);
			}

			for (const nonce of nonces) {
				await replayProtection.cleanup(nonce);
			}
		});
	});
});
