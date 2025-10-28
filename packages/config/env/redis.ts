import { z } from 'zod';

export const redisEnvSchema = z.object({
	UPSTASH_REDIS_REST_URL: z.string(),
	UPSTASH_REDIS_REST_TOKEN: z.string(),
});

export type RedisEnv = z.infer<typeof redisEnvSchema>;
