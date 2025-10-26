import type { Redis } from '@upstash/redis';

export interface ReplayProtectionConfig {
	redis: Redis;
	prefix?: string;
	ttlSeconds?: number;
}

export class ReplayProtection {
	private redis: Redis;
	private prefix: string;
	private ttlSeconds: number;

	constructor(config: ReplayProtectionConfig) {
		this.redis = config.redis;
		this.prefix = config.prefix ?? 'webhook:nonce';
		this.ttlSeconds = config.ttlSeconds ?? 300;
	}

	private getNonceKey(nonce: string): string {
		return `${this.prefix}:${nonce}`;
	}

	async hasBeenUsed(nonce: string): Promise<boolean> {
		const key = this.getNonceKey(nonce);
		const value = await this.redis.get(key);
		return value !== null;
	}

	async markAsUsed(nonce: string): Promise<boolean> {
		const key = this.getNonceKey(nonce);
		const result = await this.redis.set(key, '1', {
			ex: this.ttlSeconds,
			nx: true,
		});
		return result === 'OK';
	}

	async checkAndMark(nonce: string): Promise<boolean> {
		const alreadyUsed = await this.hasBeenUsed(nonce);
		if (alreadyUsed) {
			return false;
		}

		const marked = await this.markAsUsed(nonce);
		return marked;
	}

	async cleanup(nonce: string): Promise<void> {
		const key = this.getNonceKey(nonce);
		await this.redis.del(key);
	}
}
