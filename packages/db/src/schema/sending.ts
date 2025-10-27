import { sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	jsonb,
	pgPolicy,
	pgTable,
	smallint,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { workspaces } from './auth';
import {
	recipientStatus,
	sendJobStatus,
	suppressionReason,
	transportType,
} from './enums';
import { templateSnapshots } from './templates';
import { bytea, citext } from './types';

export const sendJobs = pgTable(
	'send_jobs',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		templateSnapshotId: uuid('template_snapshot_id').notNull(),
		transport: transportType().notNull(),
		status: sendJobStatus().default('pending').notNull(),
		idempotencyKeyHash: bytea('idempotency_key_hash').notNull(),
		createdBy: uuid('created_by'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('send_jobs_workspace_created_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('timestamptz_ops'),
			table.createdAt.desc().nullsFirst().op('timestamptz_ops')
		),
		index('send_jobs_workspace_idem_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('bytea_ops'),
			table.idempotencyKeyHash.asc().nullsLast().op('bytea_ops')
		),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'send_jobs_workspace_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.templateSnapshotId],
			foreignColumns: [templateSnapshots.id],
			name: 'send_jobs_template_snapshot_id_fkey',
		}).onDelete('set null'),
		pgPolicy('send_jobs_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('send_jobs_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('send_jobs_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('send_jobs_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('send_jobs_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('send_jobs_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('send_jobs_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('send_jobs_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export const sendRecipients = pgTable(
	'send_recipients',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		jobId: uuid('job_id').notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		email: citext('email').notNull(),
		variables: jsonb(),
		variablesHmac: bytea('variables_hmac'),
		status: recipientStatus().default('pending').notNull(),
		suppressedReason: suppressionReason('suppressed_reason'),
		errorCode: text('error_code'),
		transportMessageId: text('transport_message_id'),
		attempts: smallint().default(0).notNull(),
		firstSentAt: timestamp('first_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		lastAttemptAt: timestamp('last_attempt_at', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		index('send_recipients_job_status_idx').using(
			'btree',
			table.jobId.asc().nullsLast().op('uuid_ops'),
			table.status.asc().nullsLast().op('enum_ops')
		),
		index('send_recipients_workspace_email_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('uuid_ops'),
			table.email.asc().nullsLast().op('citext_ops')
		),
		foreignKey({
			columns: [table.jobId],
			foreignColumns: [sendJobs.id],
			name: 'send_recipients_job_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'send_recipients_workspace_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('send_recipients_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('send_recipients_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('send_recipients_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('send_recipients_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('send_recipients_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('send_recipients_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('send_recipients_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('send_recipients_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
