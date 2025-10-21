import path from 'node:path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/singlestore/driver';
import postgres from 'postgres';
import * as schema from './schema/';

config({ path: path.resolve(__dirname, '.env') });

const connectionString =
	process.env.DATABASE_URL ||
	'postgresql://postgres:postgres@localhost:54322/postgres';

const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
});

export const db = drizzle(client, { schema, logger: true });
