import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	integer,
	jsonb,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core';
import { citext } from './types';
import { workspaces } from './workspace';

export const templates = pgTable(
	'templates',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		stableId: citext('stable_id').notNull(),
		name: text().notNull(),
		description: text(),
		// currentSnapshotId: uuid('current_snapshot_id'),
		document: jsonb('document'),
		variablesSchema: jsonb('variables_schema'),
		subjectLines: text('subject_lines').array(),
		preheader: text(),
		createdBy: uuid('created_by').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'templates_workspace_id_fkey',
		}).onDelete('cascade'),
		unique('templates_workspace_stable_unique').on(
			table.workspaceId,
			table.stableId
		),
		pgPolicy('templates_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('templates_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('templates_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('templates_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('templates_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('templates_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('templates_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('templates_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export type Template = InferSelectModel<typeof templates>;
export type NewTemplate = InferInsertModel<typeof templates>;

// TODO: snapshots will be available after MVP
export const templateSnapshots = pgTable(
	'template_snapshots',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		templateId: uuid('template_id').notNull(),
		version: integer().notNull(),
		publishedAt: timestamp('published_at', {
			withTimezone: true,
			mode: 'string',
		}),
		document: jsonb('document'),
		html: text().notNull(),
		plaintext: text(),
		variablesSchema: jsonb('variables_schema').notNull(),
		subjectLines: text('subject_lines').array().notNull(),
		preheader: text(),
		notes: jsonb(),
		safetyFlags: jsonb('safety_flags'),
		sizeBytes: integer('size_bytes').notNull(),
		createdBy: uuid('created_by'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('template_snapshots_template_id_published_idx').using(
			'btree',
			table.templateId.asc().nullsLast().op('timestamptz_ops'),
			table.publishedAt.desc().nullsFirst().op('timestamptz_ops')
		),
		index('template_snapshots_variables_schema_gin').using(
			'gin',
			table.variablesSchema.asc().nullsLast().op('jsonb_ops')
		),
		foreignKey({
			columns: [table.templateId],
			foreignColumns: [templates.id],
			name: 'template_snapshots_template_id_fkey',
		}).onDelete('cascade'),
		unique('template_snapshots_version_unique').on(
			table.templateId,
			table.version
		),
		pgPolicy('template_snapshots_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('template_snapshots_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('template_snapshots_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('template_snapshots_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('template_snapshots_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('template_snapshots_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('template_snapshots_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('template_snapshots_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
