import type { Redis } from '@upstash/redis';

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
	/** Redis client instance */
	redis: Redis;
	/** Prefix for Redis keys */
	prefix?: string;
	/** Maximum number of tokens in the bucket */
	maxTokens: number;
	/** Refill rate in tokens per second */
	refillRate: number;
	/** TTL for Redis keys in seconds */
	ttl?: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
	/** Whether the request is allowed */
	allowed: boolean;
	/** Current number of tokens available */
	tokensRemaining: number;
	/** Maximum number of tokens */
	maxTokens: number;
	/** Time until next token is available (seconds) */
	retryAfter?: number;
	/** Reset timestamp (Unix timestamp in seconds) */
	resetAt?: number;
}

/**
 * Rate limit info (without consuming tokens)
 */
export interface RateLimitInfo {
	/** Current number of tokens available */
	tokensRemaining: number;
	/** Maximum number of tokens */
	maxTokens: number;
	/** Reset timestamp (Unix timestamp in seconds) */
	resetAt: number;
}

/**
 * Idempotency manager configuration
 */
export interface IdempotencyConfig {
	/** Redis client instance */
	redis: Redis;
	/** Prefix for Redis keys */
	prefix?: string;
	/** TTL for idempotency keys in seconds */
	ttl?: number;
}

/**
 * Idempotency lock result
 */
export interface IdempotencyLockResult {
	/** Whether the lock was acquired */
	acquired: boolean;
	/** Whether this is a duplicate request */
	isDuplicate: boolean;
	/** Lock key */
	lockKey: string;
}

/**
 * Idempotency result storage
 */
export interface IdempotencyResult<T = unknown> {
	/** Request body hash */
	bodyHash: string;
	/** Result data */
	result: T;
	/** Timestamp when result was stored */
	timestamp: number;
}

/**
 * Idempotency check result
 */
export interface IdempotencyCheckResult<T = unknown> {
	/** Whether this is a duplicate request */
	isDuplicate: boolean;
	/** Cached result if duplicate */
	cachedResult?: T;
	/** Body hash of the original request */
	originalBodyHash?: string;
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
	constructor(
		message: string,
		public readonly retryAfter?: number,
		public readonly resetAt?: number
	) {
		super(message);
		this.name = 'RateLimitError';
	}
}

/**
 * Idempotency conflict error
 */
export class IdempotencyConflictError extends Error {
	constructor(
		message: string,
		public readonly originalBodyHash: string,
		public readonly currentBodyHash: string
	) {
		super(message);
		this.name = 'IdempotencyConflictError';
	}
}
