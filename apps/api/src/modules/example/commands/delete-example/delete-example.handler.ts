import type { Action } from '@/shared/cqrs/bus.types';
import { ExampleNotFoundError } from '../../domain/example.error';
import { exampleActionCreator } from '../../index';

export const deleteExampleAction = exampleActionCreator<{ id: string }>(
	'DELETE_EXAMPLE'
);

export default function deleteExampleHandler({
	commandBus,
	exampleRepository,
	logger,
}: Dependencies) {
	const handler = async (action: Action<{ id: string }>): Promise<void> => {
		logger.info({ id: action.payload.id }, 'Deleting example');

		const entity = await exampleRepository.findOneById(action.payload.id);
		if (!entity) {
			throw new ExampleNotFoundError(action.payload.id);
		}

		await exampleRepository.delete(action.payload.id);

		logger.info({ id: action.payload.id }, 'Example deleted successfully');
	};

	const init = async () => {
		commandBus.register(deleteExampleAction.type, handler);
		logger.info(`✅ ${deleteExampleAction.type} registered`);
	};

	return {
		handler,
		init,
	};
}
