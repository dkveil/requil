import type { Account } from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { accountActionCreator } from '../../index';

export const getAccountAction = accountActionCreator('GET_ACCOUNT');

export default function getAccountHandler({
	queryBus,
	accountRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<undefined>
	): Promise<Account | null> => {
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		logger.info({ userId }, 'Getting account');

		const account = await accountRepository.findByUserId(userId);

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
