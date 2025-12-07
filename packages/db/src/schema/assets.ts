import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	integer,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { assetStatus, assetType } from './enums';
import { workspaces } from './workspace';

export const assets = pgTable(
	'assets',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		type: assetType().notNull(),
		status: assetStatus().default('uploading').notNull(),
		filename: text().notNull(),
		originalFilename: text('original_filename').notNull(),
		mimeType: text('mime_type').notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		storagePath: text('storage_path').notNull(),
		publicUrl: text('public_url'),
		width: integer(),
		height: integer(),
		alt: text(),
		uploadedBy: uuid('uploaded_by').notNull(),
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
			name: 'assets_workspace_id_fkey',
		}).onDelete('cascade'),
		index('assets_workspace_type_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('uuid_ops'),
			table.type.asc().nullsLast().op('enum_ops')
		),
		index('assets_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamptz_ops')
		),
		pgPolicy('assets_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('assets_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('assets_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('assets_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('assets_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('assets_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('assets_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('assets_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		pgPolicy('assets_service_role_all', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
			withCheck: sql`true`,
		}),
	]
);

export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = InferInsertModel<typeof assets>;
