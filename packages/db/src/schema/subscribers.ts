import { sql } from 'drizzle-orm';
import {
	foreignKey,
	index,
	jsonb,
	pgPolicy,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core';
import { subscriberStatus } from './enums';
import { bytea, citext } from './types';
import { workspaces } from './workspace';

export const subscribers = pgTable(
	'subscribers',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		workspaceId: uuid('workspace_id').notNull(),
		email: citext('email').notNull(),
		status: subscriberStatus().notNull(),
		attributes: jsonb(),
		confirmedAt: timestamp('confirmed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		tokenHash: bytea('token_hash'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('subscribers_attributes_gin').using(
			'gin',
			table.attributes.asc().nullsLast().op('jsonb_ops')
		),
		foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspaces.id],
			name: 'subscribers_workspace_id_fkey',
		}).onDelete('cascade'),
		unique('subscribers_workspace_email_unique').on(
			table.workspaceId,
			table.email
		),
		pgPolicy('subscribers_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('subscribers_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('subscribers_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('subscribers_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('subscribers_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('subscribers_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('subscribers_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('subscribers_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);

export const subscriberTags = pgTable(
	'subscriber_tags',
	{
		subscriberId: uuid('subscriber_id').notNull(),
		tag: text().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.subscriberId],
			foreignColumns: [subscribers.id],
			name: 'subscriber_tags_subscriber_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.subscriberId, table.tag],
			name: 'subscriber_tags_pkey',
		}),
		pgPolicy('subscriber_tags_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('subscriber_tags_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('subscriber_tags_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('subscriber_tags_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
		pgPolicy('subscriber_tags_select_auth_member', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('subscriber_tags_insert_auth_member', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('subscriber_tags_update_auth_member', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('subscriber_tags_delete_auth_member', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	]
);
