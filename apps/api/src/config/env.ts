import { baseEnvSchema, redisEnvSchema } from '@requil/config/env';
import { z } from 'zod';

const apiEnvSchema = z.object({
	...baseEnvSchema.shape,
	...redisEnvSchema.shape,
	PORT: z.coerce.number().int().positive().default(3000),
	HOST: z.string().default('0.0.0.0'),
});

type ApiEnv = z.infer<typeof apiEnvSchema>;

const parsedData = apiEnvSchema.safeParse(process.env);

if (!parsedData.success) {
	throw new Error('Invalid environment variables');
}

const env = parsedData.data;

const config = {
	nodeEnv: env.NODE_ENV,
	isDevelopment: env.NODE_ENV === 'development',
	isProduction: env.NODE_ENV === 'production',
	version: process.env.npm_package_version ?? '0.0.0',
	log: {
		level: env.LOG_LEVEL,
	},
	server: {
		host: env.HOST,
		port: env.PORT,
	},
};

export type Env = typeof config;

export { config as env };
