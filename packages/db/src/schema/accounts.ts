import type { PlanLimits } from '@requil/types';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
	jsonb,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { plan } from './enums';

export const accounts = pgTable(
	'user_accounts',
	{
		userId: uuid('user_id').primaryKey().notNull(),
		plan: plan().default('free').notNull(),
		limits: jsonb().$type<PlanLimits>().notNull(),
		currentPeriodStart: timestamp('current_period_start', {
			withTimezone: true,
			mode: 'string',
		})
			.defaultNow()
			.notNull(),
		currentPeriodEnd: timestamp('current_period_end', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		stripeCustomerId: text('stripe_customer_id'),
		stripeSubscriptionId: text('stripe_subscription_id'),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(_table) => [
		pgPolicy('user_accounts_select_anon_deny', {
			as: 'permissive',
			for: 'select',
			to: ['anon'],
			using: sql`false`,
		}),
		pgPolicy('user_accounts_select_auth_own', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`(user_id = auth.uid())`,
		}),
		pgPolicy('user_accounts_insert_anon_deny', {
			as: 'permissive',
			for: 'insert',
			to: ['anon'],
		}),
		pgPolicy('user_accounts_update_anon_deny', {
			as: 'permissive',
			for: 'update',
			to: ['anon'],
		}),
		pgPolicy('user_accounts_delete_anon_deny', {
			as: 'permissive',
			for: 'delete',
			to: ['anon'],
		}),
	]
);

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
