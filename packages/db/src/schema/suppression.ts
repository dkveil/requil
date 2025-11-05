import { sql } from 'drizzle-orm';
import {
	foreignKey,
	pgPolicy,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { suppressionReason } from './enums';
import { citext } from './types';
import { workspaces } from './workspace';

export const suppression = pgTable(
	'suppression',
	{
		workspaceId: uuid('workspace_id').notNull(),
		email: citext('email').notNull(),
		reason: suppressionReason().notNull(),
		sourceEventId: uuid('source_event_id'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'suppression_workspace_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.workspaceId, table.email],
			name: 'suppression_pkey',
		}),
		pgPolicy('suppression_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('suppression_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('suppression_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('suppression_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('suppression_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('suppression_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('suppression_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('suppression_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
