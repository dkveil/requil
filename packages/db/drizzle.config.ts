import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

const { DATABASE_URL } = env;

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/schema/index.ts',
	out: './src/migrations',
	dbCredentials: {
		url: DATABASE_URL,
	},
	verbose: true,
	strict: true,
});
