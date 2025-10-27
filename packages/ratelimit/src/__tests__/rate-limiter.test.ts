import { Redis } from '@upstash/redis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimiter } from '../core/rate-limiter';

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

describe.skipIf(!(await hasRedis()))('RateLimiter', () => {
	let redis: Redis;
	let rateLimiter: RateLimiter;

	beforeEach(() => {
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
			token: process.env.UPSTASH_REDIS_REST_TOKEN || 'test-token',
		});

		rateLimiter = new RateLimiter({
			redis,
			prefix: 'test:ratelimit',
			maxTokens: 10,
			refillRate: 1,
			ttl: 3600,
		});
	});

	afterEach(async () => {
		await rateLimiter.reset('test-identifier');
	});

	describe('limit', () => {
		it('should allow request when tokens are available', async () => {
			const result = await rateLimiter.limit('test-identifier', 1);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(9);
			expect(result.maxTokens).toBe(10);
			expect(result.retryAfter).toBeUndefined();
		});

		it('should deny request when tokens are exhausted', async () => {
			for (let i = 0; i < 10; i++) {
				await rateLimiter.limit('test-identifier', 1);
			}

			const result = await rateLimiter.limit('test-identifier', 1);

			expect(result.allowed).toBe(false);
			expect(result.tokensRemaining).toBe(0);
			expect(result.retryAfter).toBeGreaterThan(0);
			expect(result.resetAt).toBeDefined();
		});

		it('should consume multiple tokens at once', async () => {
			const result = await rateLimiter.limit('test-identifier', 5);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(5);
		});

		it('should deny request when not enough tokens available', async () => {
			await rateLimiter.limit('test-identifier', 8);

			const result = await rateLimiter.limit('test-identifier', 5);

			expect(result.allowed).toBe(false);
			expect(result.tokensRemaining).toBe(2);
		});

		it('should refill tokens over time', async () => {
			await rateLimiter.limit('test-identifier', 10);

			vi.useFakeTimers();
			vi.advanceTimersByTime(5000);

			const result = await rateLimiter.limit('test-identifier', 3);

			expect(result.allowed).toBe(true);

			vi.useRealTimers();
		});

		it('should not exceed max tokens during refill', async () => {
			await rateLimiter.limit('test-identifier', 5);

			vi.useFakeTimers();
			vi.advanceTimersByTime(20000);

			const result = await rateLimiter.limit('test-identifier', 1);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBeLessThanOrEqual(9);

			vi.useRealTimers();
		});

		it('should isolate rate limits by identifier', async () => {
			await rateLimiter.limit('identifier-1', 10);

			const result = await rateLimiter.limit('identifier-2', 1);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(9);
		});

		it('should calculate correct retry after time', async () => {
			await rateLimiter.limit('test-identifier', 10);

			const result = await rateLimiter.limit('test-identifier', 5);

			expect(result.allowed).toBe(false);
			expect(result.retryAfter).toBe(5);
		});

		it('should initialize with full tokens for new identifier', async () => {
			const result = await rateLimiter.limit('new-identifier', 1);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(9);

			await rateLimiter.reset('new-identifier');
		});
	});

	describe('getInfo', () => {
		it('should return current state without consuming tokens', async () => {
			await rateLimiter.limit('test-identifier', 3);

			const info = await rateLimiter.getInfo('test-identifier');

			expect(info.tokensRemaining).toBe(7);
			expect(info.maxTokens).toBe(10);
			expect(info.resetAt).toBeDefined();

			const secondInfo = await rateLimiter.getInfo('test-identifier');
			expect(secondInfo.tokensRemaining).toBe(7);
		});

		it('should show full tokens for new identifier', async () => {
			const info = await rateLimiter.getInfo('new-identifier');

			expect(info.tokensRemaining).toBe(10);
			expect(info.maxTokens).toBe(10);

			await rateLimiter.reset('new-identifier');
		});

		it('should calculate correct reset time', async () => {
			await rateLimiter.limit('test-identifier', 10);

			const info = await rateLimiter.getInfo('test-identifier');
			const now = Math.floor(Date.now() / 1000);

			expect(info.tokensRemaining).toBe(0);
			expect(info.resetAt).toBeGreaterThan(now);
			expect(info.resetAt).toBeLessThanOrEqual(now + 10);
		});
	});

	describe('reset', () => {
		it('should reset rate limit state', async () => {
			await rateLimiter.limit('test-identifier', 10);

			let result = await rateLimiter.limit('test-identifier', 1);
			expect(result.allowed).toBe(false);

			await rateLimiter.reset('test-identifier');

			result = await rateLimiter.limit('test-identifier', 1);
			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(9);
		});

		it('should not affect other identifiers', async () => {
			await rateLimiter.limit('identifier-1', 10);
			await rateLimiter.limit('identifier-2', 5);

			await rateLimiter.reset('identifier-1');

			const result1 = await rateLimiter.limit('identifier-1', 1);
			const result2 = await rateLimiter.limit('identifier-2', 1);

			expect(result1.allowed).toBe(true);
			expect(result1.tokensRemaining).toBe(9);
			expect(result2.tokensRemaining).toBe(4);

			await rateLimiter.reset('identifier-2');
		});
	});

	describe('configuration', () => {
		it('should respect custom prefix', async () => {
			const customLimiter = new RateLimiter({
				redis,
				prefix: 'custom:prefix',
				maxTokens: 5,
				refillRate: 1,
			});

			const result = await customLimiter.limit('test', 1);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(4);

			await customLimiter.reset('test');
		});

		it('should use default prefix when not provided', async () => {
			const defaultLimiter = new RateLimiter({
				redis,
				maxTokens: 5,
				refillRate: 1,
			});

			const result = await defaultLimiter.limit('test', 1);

			expect(result.allowed).toBe(true);

			await defaultLimiter.reset('test');
		});

		it('should respect custom max tokens', async () => {
			const customLimiter = new RateLimiter({
				redis,
				prefix: 'test:custom',
				maxTokens: 3,
				refillRate: 1,
			});

			const result = await customLimiter.limit('test', 1);

			expect(result.allowed).toBe(true);
			expect(result.maxTokens).toBe(3);
			expect(result.tokensRemaining).toBe(2);

			await customLimiter.reset('test');
		});

		it('should respect custom refill rate', async () => {
			const fastLimiter = new RateLimiter({
				redis,
				prefix: 'test:fast',
				maxTokens: 10,
				refillRate: 10,
			});

			await fastLimiter.limit('test', 10);

			vi.useFakeTimers();
			vi.advanceTimersByTime(1000);

			const result = await fastLimiter.limit('test', 5);

			expect(result.allowed).toBe(true);

			vi.useRealTimers();
			await fastLimiter.reset('test');
		});
	});

	describe('edge cases', () => {
		it('should handle zero tokens request', async () => {
			const result = await rateLimiter.limit('test-identifier', 0);

			expect(result.allowed).toBe(true);
			expect(result.tokensRemaining).toBe(10);
		});

		it('should handle fractional refill amounts', async () => {
			const slowLimiter = new RateLimiter({
				redis,
				prefix: 'test:slow',
				maxTokens: 10,
				refillRate: 0.1,
			});

			await slowLimiter.limit('test', 10);

			vi.useFakeTimers();
			vi.advanceTimersByTime(5000);

			const result = await slowLimiter.limit('test', 1);

			expect(result.allowed).toBe(false);

			vi.useRealTimers();
			await slowLimiter.reset('test');
		});

		it('should handle concurrent requests', async () => {
			const promises = Array.from({ length: 15 }, () =>
				rateLimiter.limit('concurrent-test', 1)
			);

			const results = await Promise.all(promises);

			const allowed = results.filter((r) => r.allowed).length;
			const denied = results.filter((r) => !r.allowed).length;

			expect(allowed).toBeLessThanOrEqual(10);
			expect(denied).toBeGreaterThanOrEqual(5);

			await rateLimiter.reset('concurrent-test');
		});
	});
});
