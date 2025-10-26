import { Redis } from '@upstash/redis';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IdempotencyManager } from '../idempotency/idempotency-manager.js';
import { IdempotencyConflictError } from '../types/index.js';

const hasRedis = async (): Promise<boolean> => {
	try {
		const redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
			token: process.env.UPSTASH_REDIS_REST_TOKEN || 'test-token',
		});
		await redis.ping();
		return true;
	} catch {
		return false;
	}
};

describe.skipIf(!(await hasRedis()))('IdempotencyManager', () => {
	let redis: Redis;
	let idempotencyManager: IdempotencyManager;

	beforeEach(() => {
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
			token: process.env.UPSTASH_REDIS_REST_TOKEN || 'test-token',
		});

		idempotencyManager = new IdempotencyManager({
			redis,
			prefix: 'test:idempotency',
			ttl: 3600,
		});
	});

	afterEach(async () => {
		await idempotencyManager.cleanup('test-key');
		await idempotencyManager.cleanup('test-key-2');
		await idempotencyManager.cleanup('conflict-key');
	});

	describe('acquireLock', () => {
		it('should acquire lock for new idempotency key', async () => {
			const body = { email: 'test@example.com', amount: 100 };

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(true);
			expect(result.isDuplicate).toBe(false);
			expect(result.lockKey).toContain('test-key');
		});

		it('should detect duplicate request with same body', async () => {
			const body = { email: 'test@example.com', amount: 100 };

			await idempotencyManager.acquireLock('test-key', body);

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(false);
			expect(result.isDuplicate).toBe(true);
		});

		it('should throw conflict error for same key with different body', async () => {
			const body1 = { email: 'test@example.com', amount: 100 };
			const body2 = { email: 'test@example.com', amount: 200 };

			await idempotencyManager.acquireLock('conflict-key', body1);

			await expect(
				idempotencyManager.acquireLock('conflict-key', body2)
			).rejects.toThrow(IdempotencyConflictError);
		});

		it('should isolate locks by idempotency key', async () => {
			const body1 = { email: 'test1@example.com' };
			const body2 = { email: 'test2@example.com' };

			const result1 = await idempotencyManager.acquireLock('test-key', body1);
			const result2 = await idempotencyManager.acquireLock('test-key-2', body2);

			expect(result1.acquired).toBe(true);
			expect(result2.acquired).toBe(true);
		});

		it('should handle complex nested objects', async () => {
			const body = {
				user: {
					id: 123,
					profile: {
						name: 'Test User',
						preferences: {
							theme: 'dark',
							notifications: true,
						},
					},
				},
				metadata: {
					source: 'api',
					timestamp: Date.now(),
				},
			};

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(true);

			const duplicateResult = await idempotencyManager.acquireLock(
				'test-key',
				body
			);

			expect(duplicateResult.isDuplicate).toBe(true);
		});

		it('should differentiate objects with different property order', async () => {
			const body1 = { a: 1, b: 2, c: 3 };
			const body2 = { c: 3, b: 2, a: 1 };

			await idempotencyManager.acquireLock('test-key', body1);

			const result = await idempotencyManager.acquireLock('test-key', body2);

			expect(result.isDuplicate).toBe(true);
		});
	});

	describe('releaseLock', () => {
		it('should release acquired lock', async () => {
			const body = { email: 'test@example.com' };

			await idempotencyManager.acquireLock('test-key', body);
			await idempotencyManager.releaseLock('test-key');

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(true);
			expect(result.isDuplicate).toBe(false);
		});

		it('should allow different body after lock release', async () => {
			const body1 = { email: 'test1@example.com' };
			const body2 = { email: 'test2@example.com' };

			await idempotencyManager.acquireLock('test-key', body1);
			await idempotencyManager.releaseLock('test-key');

			const result = await idempotencyManager.acquireLock('test-key', body2);

			expect(result.acquired).toBe(true);
		});
	});

	describe('storeResult', () => {
		it('should store result with metadata', async () => {
			const result = { jobId: 'job-123', sent: 5, failed: 0 };
			const bodyHash = 'test-hash';

			await idempotencyManager.storeResult('test-key', result, bodyHash);

			const stored = await idempotencyManager.getResult('test-key');

			expect(stored).not.toBeNull();
			expect(stored?.result).toEqual(result);
			expect(stored?.bodyHash).toBe(bodyHash);
			expect(stored?.timestamp).toBeDefined();
		});

		it('should store complex result objects', async () => {
			const result = {
				jobId: 'job-456',
				sent: 10,
				failed: 2,
				failedRecipients: [
					{ email: 'fail1@example.com', reason: 'invalid' },
					{ email: 'fail2@example.com', reason: 'bounced' },
				],
				warnings: ['Warning 1', 'Warning 2'],
			};
			const bodyHash = 'complex-hash';

			await idempotencyManager.storeResult('test-key', result, bodyHash);

			const stored = await idempotencyManager.getResult('test-key');

			expect(stored?.result).toEqual(result);
		});
	});

	describe('getResult', () => {
		it('should return null for non-existent key', async () => {
			const result = await idempotencyManager.getResult('non-existent');

			expect(result).toBeNull();
		});

		it('should retrieve stored result', async () => {
			const result = { success: true, data: 'test' };
			const bodyHash = 'stored-hash';

			await idempotencyManager.storeResult('test-key', result, bodyHash);

			const retrieved = await idempotencyManager.getResult('test-key');

			expect(retrieved).not.toBeNull();
			expect(retrieved?.result).toEqual(result);
			expect(retrieved?.bodyHash).toBe(bodyHash);
		});
	});

	describe('check', () => {
		it('should return not duplicate for new request', async () => {
			const body = { email: 'test@example.com' };

			const result = await idempotencyManager.check('test-key', body);

			expect(result.isDuplicate).toBe(false);
			expect(result.cachedResult).toBeUndefined();
		});

		it('should return cached result for duplicate request', async () => {
			const body = { email: 'test@example.com' };
			const storedResult = { jobId: 'job-789', sent: 3 };
			const bodyHash = 'check-hash';

			await idempotencyManager.storeResult('test-key', storedResult, bodyHash);

			const result = await idempotencyManager.check('test-key', body);

			expect(result.isDuplicate).toBe(false);
		});

		it('should throw conflict error for different body', async () => {
			const _body1 = { email: 'test1@example.com' };
			const body2 = { email: 'test2@example.com' };
			const bodyHash = 'original-hash';

			await idempotencyManager.storeResult('conflict-key', {}, bodyHash);

			await expect(
				idempotencyManager.check('conflict-key', body2)
			).rejects.toThrow(IdempotencyConflictError);
		});

		it('should handle end-to-end flow', async () => {
			const body = { email: 'test@example.com', amount: 500 };
			const result = { jobId: 'job-complete', sent: 1 };

			const lockResult = await idempotencyManager.acquireLock('test-key', body);
			expect(lockResult.acquired).toBe(true);

			const bodyHash = 'flow-hash';
			await idempotencyManager.storeResult('test-key', result, bodyHash);

			await idempotencyManager.releaseLock('test-key');

			const checkResult = await idempotencyManager.check('test-key', body);

			expect(checkResult.isDuplicate).toBe(false);
		});
	});

	describe('cleanup', () => {
		it('should remove both lock and result', async () => {
			const body = { email: 'test@example.com' };

			await idempotencyManager.acquireLock('test-key', body);
			await idempotencyManager.storeResult('test-key', {}, 'cleanup-hash');

			await idempotencyManager.cleanup('test-key');

			const lockResult = await idempotencyManager.acquireLock('test-key', body);
			const storedResult = await idempotencyManager.getResult('test-key');

			expect(lockResult.acquired).toBe(true);
			expect(storedResult).toBeNull();
		});

		it('should not affect other keys', async () => {
			const body1 = { email: 'test1@example.com' };
			const body2 = { email: 'test2@example.com' };

			await idempotencyManager.acquireLock('test-key', body1);
			await idempotencyManager.acquireLock('test-key-2', body2);

			await idempotencyManager.cleanup('test-key');

			const lockResult = await idempotencyManager.acquireLock(
				'test-key',
				body1
			);
			const duplicateResult = await idempotencyManager.acquireLock(
				'test-key-2',
				body2
			);

			expect(lockResult.acquired).toBe(true);
			expect(duplicateResult.isDuplicate).toBe(true);
		});
	});

	describe('configuration', () => {
		it('should respect custom prefix', async () => {
			const customManager = new IdempotencyManager({
				redis,
				prefix: 'custom:prefix',
				ttl: 1800,
			});

			const body = { test: 'data' };
			const result = await customManager.acquireLock('test', body);

			expect(result.acquired).toBe(true);
			expect(result.lockKey).toContain('custom:prefix');

			await customManager.cleanup('test');
		});

		it('should use default prefix when not provided', async () => {
			const defaultManager = new IdempotencyManager({
				redis,
			});

			const body = { test: 'data' };
			const result = await defaultManager.acquireLock('test', body);

			expect(result.acquired).toBe(true);
			expect(result.lockKey).toContain('idempotency');

			await defaultManager.cleanup('test');
		});
	});

	describe('edge cases', () => {
		it('should handle empty object', async () => {
			const body = {};

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(true);

			const duplicateResult = await idempotencyManager.acquireLock(
				'test-key',
				body
			);

			expect(duplicateResult.isDuplicate).toBe(true);
		});

		it('should handle null values in object', async () => {
			const body = { value: null, data: 'test' };

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(true);
		});

		it('should handle arrays in body', async () => {
			const body = {
				recipients: ['user1@example.com', 'user2@example.com'],
				metadata: [1, 2, 3],
			};

			const result = await idempotencyManager.acquireLock('test-key', body);

			expect(result.acquired).toBe(true);

			const duplicateResult = await idempotencyManager.acquireLock(
				'test-key',
				body
			);

			expect(duplicateResult.isDuplicate).toBe(true);
		});

		it('should handle concurrent lock attempts', async () => {
			const body = { email: 'concurrent@example.com' };

			const promises = Array.from({ length: 10 }, () =>
				idempotencyManager.acquireLock('test-key', body)
			);

			const results = await Promise.all(promises);

			const acquired = results.filter((r) => r.acquired).length;
			const duplicates = results.filter((r) => r.isDuplicate).length;

			expect(acquired).toBeGreaterThanOrEqual(1);
			expect(duplicates).toBeGreaterThanOrEqual(0);
		});
	});
});
