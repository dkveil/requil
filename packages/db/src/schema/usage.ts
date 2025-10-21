import { sql } from 'drizzle-orm';
import {
	date,
	foreignKey,
	index,
	integer,
	pgPolicy,
	pgTable,
	primaryKey,
	uuid,
} from 'drizzle-orm/pg-core';
import { workspaces } from './auth';

export const usageCountersDaily = pgTable(
	'usage_counters_daily',
	{
		workspaceId: uuid('workspace_id').notNull(),
		day: date().notNull(),
		renders: integer().default(0).notNull(),
		sends: integer().default(0).notNull(),
		ai: integer().default(0).notNull(),
	},
	(table) => [
		index('usage_counters_daily_workspace_day_desc_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('date_ops'),
			table.day.desc().nullsFirst().op('date_ops')
		),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'usage_counters_daily_workspace_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.workspaceId, table.day],
			name: 'usage_counters_daily_pkey',
		}),
		pgPolicy('usage_counters_daily_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('usage_counters_daily_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('usage_counters_daily_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('usage_counters_daily_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('usage_counters_daily_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('usage_counters_daily_insert_auth_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('usage_counters_daily_update_auth_deny', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('usage_counters_daily_delete_auth_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
