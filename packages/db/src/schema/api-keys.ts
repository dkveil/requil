import { type InferInsertModel, type InferSelectModel, sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core';
import { apiScope } from './enums';
import { workspaces } from './workspace';

export const apiKeys = pgTable(
	'api_keys',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		name: text().notNull(),
		keyPrefix: text('key_prefix').notNull(),
		keyHash: text('key_hash').notNull(),
		createdBy: uuid('created_by'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		lastUsedAt: timestamp('last_used_at', {
			withTimezone: true,
			mode: 'string',
		}),
		revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index('api_keys_workspace_id_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('uuid_ops')
		),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'api_keys_workspace_id_fkey',
		}).onDelete('cascade'),
		unique('api_keys_key_prefix_key').on(table.keyPrefix),
		pgPolicy('api_keys_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('api_keys_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('api_keys_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('api_keys_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('api_keys_select_auth_owner', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('api_keys_insert_auth_owner', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('api_keys_update_auth_owner', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('api_keys_delete_auth_owner', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export type ApiKey = InferSelectModel<typeof apiKeys>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;
export type ApiKeyScope = (typeof apiScope.enumValues)[number];

export const apiKeyScopes = pgTable(
	'api_key_scopes',
	{
		apiKeyId: uuid('api_key_id').notNull(),
		scope: apiScope().notNull(),
	},
	(table) => [
		index('api_key_scopes_scope_idx').using(
			'btree',
			table.scope.asc().nullsLast().op('enum_ops')
		),
		foreignKey({
			columns: [table.apiKeyId],
			foreignColumns: [apiKeys.id],
			name: 'api_key_scopes_api_key_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('api_key_scopes_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('api_key_scopes_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('api_key_scopes_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('api_key_scopes_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('api_key_scopes_select_auth_owner', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('api_key_scopes_insert_auth_owner', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('api_key_scopes_update_auth_owner', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('api_key_scopes_delete_auth_owner', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export type ApiKeyScopeRecord = InferSelectModel<typeof apiKeyScopes>;
export type NewApiKeyScopeRecord = InferInsertModel<typeof apiKeyScopes>;
