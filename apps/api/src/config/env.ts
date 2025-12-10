import path from 'node:path';
import {
	baseEnvSchema,
	redisEnvSchema,
	supabaseEnvSchema,
} from '@requil/config/env';
import { config as dotenv } from 'dotenv';
import { z } from 'zod';

dotenv({ path: path.resolve(process.cwd(), '.env') });

const apiEnvSchema = z.object({
	...baseEnvSchema.shape,
	...redisEnvSchema.shape,
	...supabaseEnvSchema.shape,
	FRONTEND_URL: z.url().default('http://localhost:5137'),
	PORT: z.coerce.number().int().positive().default(3000),
	HOST: z.string().default('0.0.0.0'),
	CORS_ORIGINS: z
		.string()
		.default('http://localhost:5137,http://localhost:3000'),
	RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
	DEFAULT_FROM_EMAIL: z.email().default('noreply@requil.dev'),
});

type ApiEnv = z.infer<typeof apiEnvSchema>;

const parsedData = apiEnvSchema.safeParse(process.env);

if (!parsedData.success) {
	const errors = parsedData.error.flatten().fieldErrors;

	throw new Error(
		`Invalid environment variables: \n${Object.values(errors).join('\n')}`
	);
}

const env = parsedData.data;

const config = {
	frontendUrl: env.FRONTEND_URL,
	nodeEnv: env.NODE_ENV,
	isDevelopment: env.NODE_ENV === 'development',
	isProduction: env.NODE_ENV === 'production',
	version: process.env.npm_package_version ?? '0.0.0',
	cors:
		process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [],
	log: {
		level: env.LOG_LEVEL,
	},
	server: {
		host: env.HOST,
		port: env.PORT,
	},
	supabase: {
		url: env.SUPABASE_URL,
		anonKey: env.SUPABASE_ANON_KEY,
		serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
		jwtSecret: env.SUPABASE_JWT_SECRET,
	},
	redis: {
		url: env.UPSTASH_REDIS_REST_URL,
		token: env.UPSTASH_REDIS_REST_TOKEN,
	},
	email: {
		resendApiKey: env.RESEND_API_KEY,
		defaultFromEmail: env.DEFAULT_FROM_EMAIL,
	},
};

export type Env = typeof config & ApiEnv;

export { config as env };
