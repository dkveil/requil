import path from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: path.resolve(process.cwd(), '.env') });

const serverSchema = z.object({
	NODE_ENV: z.enum(['development', 'production']).default('development'),
	DATABASE_URL: z
		.string()
		.min(1)
		.default('postgresql://postgres:postgres@localhost:54322/postgres'),
});

const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
	throw new Error(
		`Invalid environment variables: ${JSON.stringify(_serverEnv.error.flatten().fieldErrors)}`
	);
}

const { NODE_ENV, DATABASE_URL } = _serverEnv.data;

export const env = {
	NODE_ENV,
	DATABASE_URL,
};
