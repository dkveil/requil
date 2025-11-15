import type { FindAssetsInput, FindAssetsResponse } from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { assetsActionCreator } from '../..';
import { AssetAccessDeniedError } from '../../domain/asset.error';

export const findAssetsAction =
	assetsActionCreator<FindAssetsInput>('FIND_ASSETS');

export default function findAssetsHandler({
	queryBus,
	assetRepository,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<FindAssetsInput>
	): Promise<FindAssetsResponse> => {
		const { workspaceId, type, search, page = 1, limit = 50 } = action.payload;
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		logger.info({ workspaceId, type, search }, 'Finding assets');

		const workspace = await workspaceRepository.findByIdWithRole(
			workspaceId,
			userId
		);

		if (!workspace) {
			throw new AssetAccessDeniedError('Workspace not found or access denied', {
				workspaceId,
			});
		}

		const offset = (page - 1) * limit;
		const { data, total } = await assetRepository.findByWorkspaceId(
			workspaceId,
			{
				type,
				search,
				limit,
				offset,
			}
		);

		const totalPages = Math.ceil(total / limit);

		return {
			data,
			meta: {
				page,
				limit,
				total,
				totalPages,
			},
		};
	};

	const init = async () => {
		queryBus.register(findAssetsAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
