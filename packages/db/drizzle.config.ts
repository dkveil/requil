import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/schema/index.ts',
	out: './src/migrations',
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			'postgresql://postgres:postgres@localhost:54322/postgres',
	},
	verbose: true,
	strict: true,
});
