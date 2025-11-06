import type { FindUserWorkspacesResponse } from '@requil/types/workspace';
import type { Action } from '@/shared/cqrs/bus.types';
import { workspaceActionCreator } from '../../index';

export const findUserWorkspacesAction = workspaceActionCreator<void>(
	'FIND_USER_WORKSPACES'
);

export default function findUserWorkspacesHandler({
	queryBus,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<void>
	): Promise<FindUserWorkspacesResponse> => {
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		logger.info({ userId }, 'Finding user workspaces');

		const workspaces = await workspaceRepository.findByUserId(userId);

		logger.info(
			{ userId, count: workspaces?.length ?? 0 },
			'Found user workspaces'
		);

		return {
			workspaces: (workspaces || []).map((w) => ({
				id: w.id,
				name: w.name,
				slug: w.slug,
				role: w.role,
				createdAt: w.createdAt,
			})),
			total: workspaces?.length ?? 0,
		};
	};

	const init = async () => {
		queryBus.register(findUserWorkspacesAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
