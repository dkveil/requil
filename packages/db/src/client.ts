import path from 'node:path';
import { config } from 'dotenv';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/';

config({ path: path.resolve(process.cwd(), '.env') });

type DBType = PostgresJsDatabase<typeof schema>;

declare global {
	var db: DBType | undefined;
}

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required in production');
}

const connectionString =
	process.env.DATABASE_URL ||
	'postgresql://postgres:postgres@localhost:54322/postgres';

export const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
	prepare: false,
});

// biome-ignore lint/suspicious/noRedeclare: global.db type declaration conflicts with local db variable
let db: DBType;
if (isProduction) {
	db = drizzle(client, { schema, logger: false });
} else {
	if (!global.db) {
		global.db = drizzle(client, { schema, logger: true });
	}
	db = global.db;
}

export { db };
