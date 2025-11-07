import { type Account, accounts } from '@requil/db';
import type { PlanName } from '@requil/types';
import { eq } from 'drizzle-orm';
import { getPlanLimits } from '../domain/plan-limits.config';
import type { IAccountRepository } from './account.repository.port';

export default function accountRepository({
	db,
	logger,
}: Dependencies): IAccountRepository {
	const findByUserId = async (userId: string): Promise<Account | undefined> => {
		const result = await db
			.select()
			.from(accounts)
			.where(eq(accounts.userId, userId))
			.limit(1);

		return result[0];
	};

	const exists = async (userId: string): Promise<boolean> => {
		const result = await db
			.select({ userId: accounts.userId })
			.from(accounts)
			.where(eq(accounts.userId, userId))
			.limit(1);

		return result.length > 0;
	};

	const create = async (
		userId: string,
		planName: PlanName = 'free'
	): Promise<Account> => {
		const limits = getPlanLimits(planName);
		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [account] = await db
			.insert(accounts)
			.values({
				userId,
				plan: planName,
				limits,
				currentPeriodStart: now.toISOString(),
				currentPeriodEnd: periodEnd.toISOString(),
				stripeCustomerId: null,
				stripeSubscriptionId: null,
			})
			.returning();

		logger.info({ userId, plan: planName }, 'Account created');

		if (!account) {
			throw new Error('Failed to create account');
		}

		return account;
	};

	const updatePlan = async (
		userId: string,
		planName: PlanName
	): Promise<void> => {
		const limits = getPlanLimits(planName);

		await db
			.update(accounts)
			.set({
				plan: planName,
				limits,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(accounts.userId, userId));

		logger.info({ userId, plan: planName }, 'Account plan updated');
	};

	return {
		findByUserId,
		exists,
		create,
		updatePlan,
	};
}
