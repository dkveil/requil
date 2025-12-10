import type {
	ListApiKeysQuery,
	ListApiKeysResponse,
} from '@requil/types/api-keys';
import type { Action } from '@/shared/cqrs/bus.types';
import { apiKeyActionCreator } from '../../index';

export const listApiKeysAction =
	apiKeyActionCreator<ListApiKeysQuery>('LIST_API_KEYS');

export default function listApiKeysHandler({
	queryBus,
	apiKeyRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<ListApiKeysQuery>
	): Promise<ListApiKeysResponse> => {
		logger.info({ payload: action.payload }, 'Listing API keys');

		const workspaceId = action.meta?.workspaceId as string;

		if (!workspaceId) {
			throw new Error('Workspace ID is required');
		}

		const { page = 1, limit = 20, includeRevoked = false } = action.payload;

		const result = await apiKeyRepository.findByWorkspace(
			workspaceId,
			includeRevoked,
			page,
			limit
		);

		logger.info(
			{
				workspaceId,
				count: result.data.length,
				total: result.total,
			},
			'API keys listed successfully'
		);

		return {
			data: result.data,
			meta: {
				total: result.total,
				page,
				limit,
			},
		};
	};

	const init = async () => {
		queryBus.register(listApiKeysAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
