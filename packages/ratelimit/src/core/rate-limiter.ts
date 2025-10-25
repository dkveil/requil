import type { Redis } from '@upstash/redis';
import type {
	RateLimiterConfig,
	RateLimitInfo,
	RateLimitResult,
} from '../types/index.js';

export class RateLimiter {
	private readonly redis: Redis;
	private readonly prefix: string;
	private readonly maxTokens: number;
	private readonly refillRate: number;
	private readonly ttl: number;

	constructor(config: RateLimiterConfig) {
		this.redis = config.redis;
		this.prefix = config.prefix || 'ratelimit';
		this.maxTokens = config.maxTokens;
		this.refillRate = config.refillRate;
		this.ttl = config.ttl || 3600;
	}

	async limit(identifier: string, tokens = 1): Promise<RateLimitResult> {
		const key = this.getKey(identifier);
		const now = Date.now() / 1000;

		const bucket = await this.getBucket(key, now);

		const elapsedTime = now - bucket.lastRefillTime;
		const refillAmount = elapsedTime * this.refillRate;
		const currentTokens = Math.min(
			this.maxTokens,
			bucket.tokens + refillAmount
		);

		const allowed = currentTokens >= tokens;

		if (allowed) {
			const newTokens = currentTokens - tokens;
			await this.updateBucket(key, newTokens, now);

			return {
				allowed: true,
				tokensRemaining: Math.floor(newTokens),
				maxTokens: this.maxTokens,
			};
		}

		const tokensNeeded = tokens - currentTokens;
		const retryAfter = Math.ceil(tokensNeeded / this.refillRate);
		const resetAt = Math.ceil(now + retryAfter);

		return {
			allowed: false,
			tokensRemaining: Math.floor(currentTokens),
			maxTokens: this.maxTokens,
			retryAfter,
			resetAt,
		};
	}

	async getInfo(identifier: string): Promise<RateLimitInfo> {
		const key = this.getKey(identifier);
		const now = Date.now() / 1000;

		const bucket = await this.getBucket(key, now);

		const elapsedTime = now - bucket.lastRefillTime;
		const refillAmount = elapsedTime * this.refillRate;
		const currentTokens = Math.min(
			this.maxTokens,
			bucket.tokens + refillAmount
		);

		const tokensToFull = this.maxTokens - currentTokens;
		const timeToFull = tokensToFull / this.refillRate;
		const resetAt = Math.ceil(now + timeToFull);

		return {
			tokensRemaining: Math.floor(currentTokens),
			maxTokens: this.maxTokens,
			resetAt,
		};
	}

	async reset(identifier: string): Promise<void> {
		const key = this.getKey(identifier);
		await this.redis.del(key);
	}

	private async getBucket(
		key: string,
		now: number
	): Promise<{ tokens: number; lastRefillTime: number }> {
		const data = await this.redis.get<{
			tokens: number;
			lastRefillTime: number;
		}>(key);

		if (!data) {
			return {
				tokens: this.maxTokens,
				lastRefillTime: now,
			};
		}

		return data;
	}

	private async updateBucket(
		key: string,
		tokens: number,
		lastRefillTime: number
	): Promise<void> {
		await this.redis.set(
			key,
			{
				tokens,
				lastRefillTime,
			},
			{
				ex: this.ttl,
			}
		);
	}

	private getKey(identifier: string): string {
		return `${this.prefix}:${identifier}`;
	}
}
