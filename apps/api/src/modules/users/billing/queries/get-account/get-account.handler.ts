import type { UserAccount } from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { billingActionCreator } from '../../index';

export const getAccountAction = billingActionCreator('GET_ACCOUNT');

export default function getAccountHandler({
	queryBus,
	userAccountRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<undefined>
	): Promise<UserAccount | null> => {
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		logger.info({ userId }, 'Getting user account');

		const account = await userAccountRepository.findByUserId(userId);

		if (!account) {
			return null;
		}

		return {
			userId: account.userId,
			plan: account.plan,
			limits: account.limits,
			currentPeriodStart: account.currentPeriodStart,
			currentPeriodEnd: account.currentPeriodEnd,
			stripeCustomerId: account.stripeCustomerId || null,
			stripeSubscriptionId: account.stripeSubscriptionId || null,
			updatedAt: account.updatedAt,
		};
	};

	const init = async () => {
		queryBus.register(getAccountAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
