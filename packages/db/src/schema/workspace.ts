import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	foreignKey,
	index,
	jsonb,
	pgEnum,
	pgPolicy,
	pgTable,
	primaryKey,
	smallint,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { plan, transportState, transportType } from './enums';
import { bytea, citext } from './types';

export const workspaceRole = pgEnum('workspace_role', ['owner', 'member']);

export const workspaces = pgTable(
	'workspaces',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		createdBy: uuid('created_by').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(_table) => [
		pgPolicy('workspaces_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('workspaces_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('workspaces_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('workspaces_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('workspaces_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('workspaces_insert_auth_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('workspaces_update_auth_owner', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('workspaces_delete_auth_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export type Workspace = InferSelectModel<typeof workspaces>;
export type NewWorkspace = InferInsertModel<typeof workspaces>;

export const workspaceMembers = pgTable(
	'workspace_members',
	{
		workspaceId: uuid('workspace_id').notNull(),
		userId: uuid('user_id').notNull(),
		role: workspaceRole().notNull(),
		invitedAt: timestamp('invited_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		acceptedAt: timestamp('accepted_at', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'workspace_members_workspace_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.workspaceId, table.userId],
			name: 'workspace_members_pkey',
		}),
		pgPolicy('workspace_members_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('workspace_members_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('workspace_members_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('workspace_members_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('workspace_members_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_members_insert_auth_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_members_update_auth_deny', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_members_delete_auth_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export type WorkspaceMember = InferSelectModel<typeof workspaceMembers>;
export type NewWorkspaceMember = InferInsertModel<typeof workspaceMembers>;

export const workspaceInvitations = pgTable(
	'workspace_invitations',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		inviteeEmail: citext('invitee_email').notNull(),
		role: workspaceRole().default('member').notNull(),
		inviterId: uuid('inviter_id').notNull(),
		tokenHash: bytea('token_hash').notNull(),
		expiresAt: timestamp('expires_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		acceptedBy: uuid('accepted_by'),
		acceptedAt: timestamp('accepted_at', {
			withTimezone: true,
			mode: 'string',
		}),
		canceledAt: timestamp('canceled_at', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		uniqueIndex('workspace_invitations_open_unique')
			.using(
				'btree',
				table.workspaceId.asc().nullsLast().op('uuid_ops'),
				table.inviteeEmail.asc().nullsLast().op('citext_ops')
			)
			.where(sql`((accepted_at IS NULL) AND (canceled_at IS NULL))`),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'workspace_invitations_workspace_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('workspace_invitations_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('workspace_invitations_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('workspace_invitations_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('workspace_invitations_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('workspace_invitations_select_auth_owner', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_invitations_insert_auth_owner', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_invitations_update_auth_owner', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_invitations_delete_auth_owner', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export const workspaceBrandkit = pgTable(
	'workspace_brandkit',
	{
		workspaceId: uuid('workspace_id').primaryKey().notNull(),
		data: jsonb().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'workspace_brandkit_workspace_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('workspace_brandkit_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('workspace_brandkit_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('workspace_brandkit_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('workspace_brandkit_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('workspace_brandkit_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_brandkit_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_brandkit_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_brandkit_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export const workspaceTransports = pgTable(
	'workspace_transports',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		type: transportType().notNull(),
		state: transportState().default('unverified').notNull(),
		fromDomain: text('from_domain'),
		fromEmail: citext('from_email'),
		smtpHost: text('smtp_host'),
		smtpPort: smallint('smtp_port'),
		smtpSecure: boolean('smtp_secure'),
		smtpUser: text('smtp_user'),
		secretEncrypted: bytea('secret_encrypted').notNull(),
		encKeyId: text('enc_key_id'),
		nonce: bytea('nonce'),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('workspace_transports_workspace_state_idx').using(
			'btree',
			table.workspaceId.asc().nullsLast().op('uuid_ops'),
			table.state.asc().nullsLast().op('enum_ops')
		),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'workspace_transports_workspace_id_fkey',
		}).onDelete('cascade'),
		unique('workspace_transports_workspace_id_key').on(table.workspaceId),
		pgPolicy('workspace_transports_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('workspace_transports_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('workspace_transports_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('workspace_transports_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('workspace_transports_select_auth_owner', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_transports_insert_auth_owner', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_transports_update_auth_owner', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_transports_delete_auth_owner', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		check(
			'workspace_transports_smtp_port_check',
			sql`(smtp_port IS NULL) OR ((smtp_port >= 1) AND (smtp_port <= 65535))`
		),
	]
);

export const workspacePlans = pgTable(
	'workspace_plans',
	{
		workspaceId: uuid('workspace_id').primaryKey().notNull(),
		plan: plan().notNull(),
		limits: jsonb().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'workspace_plans_workspace_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('workspace_plans_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('workspace_plans_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('workspace_plans_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('workspace_plans_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('workspace_plans_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_plans_insert_auth_owner', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_plans_update_auth_owner', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('workspace_plans_delete_auth_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
