import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './config/env';
import * as schema from './schema/index';

export type DBType = PostgresJsDatabase<typeof schema>;

const { NODE_ENV, DATABASE_URL } = env;

declare global {
	var db: DBType | undefined;
}

const isProduction = NODE_ENV === 'production';

if (isProduction && !DATABASE_URL) {
	throw new Error('DATABASE_URL is required in production');
}

const connectionString = DATABASE_URL;

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
