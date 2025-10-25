import type { Redis } from '@upstash/redis';
import type {
	IdempotencyCheckResult,
	IdempotencyConfig,
	IdempotencyLockResult,
	IdempotencyResult,
} from '../types/index.js';
import { IdempotencyConflictError } from '../types/index.js';
import { hashObject } from '../utils/index.js';

export class IdempotencyManager {
	private readonly redis: Redis;
	private readonly prefix: string;
	private readonly ttl: number;

	constructor(config: IdempotencyConfig) {
		this.redis = config.redis;
		this.prefix = config.prefix || 'idempotency';
		this.ttl = config.ttl || 86400;
	}

	async acquireLock(
		idempotencyKey: string,
		body: unknown
	): Promise<IdempotencyLockResult> {
		const lockKey = this.getLockKey(idempotencyKey);
		const bodyHash = hashObject(body);

		const existingLock = await this.redis.get<{ bodyHash: string }>(lockKey);

		if (existingLock) {
			if (existingLock.bodyHash === bodyHash) {
				return {
					acquired: false,
					isDuplicate: true,
					lockKey,
				};
			}

			throw new IdempotencyConflictError(
				'Idempotency key conflict: different request body with same key',
				existingLock.bodyHash,
				bodyHash
			);
		}

		await this.redis.set(
			lockKey,
			{ bodyHash },
			{
				ex: this.ttl,
				nx: true,
			}
		);

		return {
			acquired: true,
			isDuplicate: false,
			lockKey,
		};
	}

	async releaseLock(idempotencyKey: string): Promise<void> {
		const lockKey = this.getLockKey(idempotencyKey);
		await this.redis.del(lockKey);
	}

	async storeResult<T>(
		idempotencyKey: string,
		result: T,
		bodyHash: string
	): Promise<void> {
		const resultKey = this.getResultKey(idempotencyKey);

		const data: IdempotencyResult<T> = {
			bodyHash,
			result,
			timestamp: Date.now(),
		};

		await this.redis.set(resultKey, data, {
			ex: this.ttl,
		});
	}

	async getResult<T>(
		idempotencyKey: string
	): Promise<IdempotencyResult<T> | null> {
		const resultKey = this.getResultKey(idempotencyKey);
		return await this.redis.get<IdempotencyResult<T>>(resultKey);
	}

	async check<T>(
		idempotencyKey: string,
		body: unknown
	): Promise<IdempotencyCheckResult<T>> {
		const bodyHash = hashObject(body);
		const storedResult = await this.getResult<T>(idempotencyKey);

		if (!storedResult) {
			return {
				isDuplicate: false,
			};
		}

		if (storedResult.bodyHash !== bodyHash) {
			throw new IdempotencyConflictError(
				'Idempotency key conflict: different request body with same key',
				storedResult.bodyHash,
				bodyHash
			);
		}

		return {
			isDuplicate: true,
			cachedResult: storedResult.result,
			originalBodyHash: storedResult.bodyHash,
		};
	}

	async cleanup(idempotencyKey: string): Promise<void> {
		const lockKey = this.getLockKey(idempotencyKey);
		const resultKey = this.getResultKey(idempotencyKey);

		await Promise.all([this.redis.del(lockKey), this.redis.del(resultKey)]);
	}

	private getLockKey(idempotencyKey: string): string {
		return `${this.prefix}:lock:${idempotencyKey}`;
	}

	private getResultKey(idempotencyKey: string): string {
		return `${this.prefix}:result:${idempotencyKey}`;
	}
}
