import type { Action } from '@/shared/cqrs/bus.types';
import { toDtoList } from '../../example.mapper';
import { exampleActionCreator } from '../../index';
import type {
	FindExamplesQuery,
	FindExamplesResponse,
} from './find-examples.schema';

export const findExamplesAction =
	exampleActionCreator<FindExamplesQuery>('FIND_EXAMPLES');

export default function findExamplesHandler({
	queryBus,
	exampleRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<FindExamplesQuery>
	): Promise<FindExamplesResponse> => {
		const { page, limit, orderBy, orderDirection } = action.payload;

		logger.info({ page, limit, orderBy }, 'Finding examples');

		const offset = page * limit;

		const result = await exampleRepository.findAllPaginated({
			limit,
			offset,
			orderBy: {
				field: orderBy,
				direction: orderDirection,
			},
		});

		return {
			data: toDtoList(result.data),
			pagination: result.pagination,
		};
	};

	const init = async () => {
		queryBus.register(findExamplesAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
