import { sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	pgPolicy,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { workspaces } from './auth.js';
import { eventType, transportType } from './enums.js';
import { sendJobs } from './sending.js';
import { templateSnapshots } from './templates.js';
import { citext } from './types.js';

export const events = pgTable(
	'events',
	{
		id: uuid().defaultRandom().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		type: eventType().notNull(),
		jobId: uuid('job_id'),
		recipientEmail: citext('recipient_email').notNull(),
		transport: transportType().notNull(),
		templateSnapshotId: uuid('template_snapshot_id'),
		externalId: text('external_id'),
		occurredAt: timestamp('occurred_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
	},
	(table) => [
		index('events_workspace_occurred_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('uuid_ops'),
			table.occurredAt.asc().nullsLast().op('timestamptz_ops')
		),
		index('events_job_id_idx').using(
			'btree',
			table.jobId.asc().nullsLast().op('uuid_ops')
		),
		index('events_recipient_email_idx').using(
			'btree',
			table.recipientEmail.asc().nullsLast().op('citext_ops')
		),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'events_workspace_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.jobId],
			foreignColumns: [sendJobs.id],
			name: 'events_job_id_fkey',
		}).onDelete('set null'),
		foreignKey({
			columns: [table.templateSnapshotId],
			foreignColumns: [templateSnapshots.id],
			name: 'events_template_snapshot_id_fkey',
		}).onDelete('set null'),
		primaryKey({
			columns: [table.id, table.occurredAt],
			name: 'events_pkey',
		}),
		pgPolicy('events_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('events_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('events_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('events_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('events_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('events_insert_auth_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('events_update_auth_deny', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('events_delete_auth_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
