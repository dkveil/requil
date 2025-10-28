import type { Action } from '@/shared/cqrs/bus.types';
import { ExampleEntity } from '../../domain/example.domain';
import { ExampleAlreadyExistsError } from '../../domain/example.error';
import { toDto } from '../../example.mapper';
import { exampleActionCreator } from '../../index';
import type {
	CreateExampleBody,
	CreateExampleResponse,
} from './create-example.schema';

export const createExampleAction =
	exampleActionCreator<CreateExampleBody>('CREATE_EXAMPLE');

export default function createExampleHandler({
	commandBus,
	exampleRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<CreateExampleBody>
	): Promise<CreateExampleResponse> => {
		logger.info({ payload: action.payload }, 'Creating example');

		const exists = await exampleRepository.existsByName(action.payload.name);
		if (exists) {
			throw new ExampleAlreadyExistsError(action.payload.name);
		}

		const entity = ExampleEntity.create({
			name: action.payload.name,
		});

		await exampleRepository.create(entity);

		return toDto(entity);
	};

	const init = async () => {
		commandBus.register(createExampleAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
