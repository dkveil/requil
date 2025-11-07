import { type UserAccount, userAccounts } from '@requil/db';
import type { PlanName } from '@requil/types';
import { eq } from 'drizzle-orm';
import { getPlanLimits } from '../domain/plan-limits.config';
import type { IUserAccountRepository } from './user-account.repository.port';

export default function userAccountRepository({
	db,
	logger,
}: Dependencies): IUserAccountRepository {
	const findByUserId = async (
		userId: string
	): Promise<UserAccount | undefined> => {
		const result = await db
			.select()
			.from(userAccounts)
			.where(eq(userAccounts.userId, userId))
			.limit(1);

		return result[0];
	};

	const exists = async (userId: string): Promise<boolean> => {
		const result = await db
			.select({ userId: userAccounts.userId })
			.from(userAccounts)
			.where(eq(userAccounts.userId, userId))
			.limit(1);

		return result.length > 0;
	};

	const create = async (
		userId: string,
		planName: PlanName = 'free'
	): Promise<UserAccount> => {
		const limits = getPlanLimits(planName);
		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [account] = await db
			.insert(userAccounts)
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

		logger.info({ userId, plan: planName }, 'User account created');

		if (!account) {
			throw new Error('Failed to create user account');
		}

		return account;
	};

	const updatePlan = async (
		userId: string,
		planName: PlanName
	): Promise<void> => {
		const limits = getPlanLimits(planName);

		await db
			.update(userAccounts)
			.set({
				plan: planName,
				limits,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(userAccounts.userId, userId));

		logger.info({ userId, plan: planName }, 'User plan updated');
	};

	return {
		findByUserId,
		exists,
		create,
		updatePlan,
	};
}
