import { IdempotencyManager } from '@requil/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/config';

export default function redisService() {
	const redis = new Redis({
		url: env.redis.url,
		token: env.redis.token,
	});

	const idempotencyManager = new IdempotencyManager({
		redis,
		prefix: 'send',
		ttl: 86400,
	});

	return {
		redis,
		idempotencyManager,
	};
}

declare global {
	export interface Dependencies {
		redisService: ReturnType<typeof redisService>;
	}
}
