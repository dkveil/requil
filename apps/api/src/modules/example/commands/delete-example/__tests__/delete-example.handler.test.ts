import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExampleEntity } from '../../../domain/example.domain';
import { ExampleNotFoundError } from '../../../domain/example.error';
import deleteExampleHandler, {
	deleteExampleAction,
} from '../delete-example.handler';

describe('DeleteExampleHandler', () => {
	let handler: ReturnType<typeof deleteExampleHandler>;

	const mockCommandBus = {
		register: vi.fn(),
	};

	const mockExampleRepository = {
		findOneById: vi.fn(),
		delete: vi.fn(),
	};

	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		handler = deleteExampleHandler({
			commandBus: mockCommandBus,
			exampleRepository: mockExampleRepository,
			logger: mockLogger,
		} as unknown as Dependencies);
	});

	describe('handler', () => {
		it('should delete example successfully', async () => {
			const id = 'test-id';
			const mockEntity = ExampleEntity.create({ name: 'Test Example' });

			mockExampleRepository.findOneById.mockResolvedValue(mockEntity);
			mockExampleRepository.delete.mockResolvedValue(undefined);

			const action = deleteExampleAction({ id });
			await handler.handler(action);

			expect(mockExampleRepository.findOneById).toHaveBeenCalledWith(id);
			expect(mockExampleRepository.delete).toHaveBeenCalledWith(id);
			expect(mockLogger.info).toHaveBeenCalledWith({ id }, 'Deleting example');
			expect(mockLogger.info).toHaveBeenCalledWith(
				{ id },
				'Example deleted successfully'
			);
		});

		it('should throw error when example not found', async () => {
			const id = 'non-existent-id';
			mockExampleRepository.findOneById.mockResolvedValue(undefined);

			const action = deleteExampleAction({ id });

			await expect(handler.handler(action)).rejects.toThrow(
				ExampleNotFoundError
			);
			await expect(handler.handler(action)).rejects.toThrow(
				`Example with id ${id} not found`
			);
			expect(mockExampleRepository.delete).not.toHaveBeenCalled();
		});

		it('should log correct information', async () => {
			const id = 'test-id';
			const mockEntity = ExampleEntity.create({ name: 'Test Example' });

			mockExampleRepository.findOneById.mockResolvedValue(mockEntity);
			mockExampleRepository.delete.mockResolvedValue(undefined);

			const action = deleteExampleAction({ id });
			await handler.handler(action);

			expect(mockLogger.info).toHaveBeenNthCalledWith(
				1,
				{ id },
				'Deleting example'
			);
			expect(mockLogger.info).toHaveBeenNthCalledWith(
				2,
				{ id },
				'Example deleted successfully'
			);
		});
	});

	describe('init', () => {
		it('should register handler in command bus', async () => {
			await handler.init();

			expect(mockCommandBus.register).toHaveBeenCalledWith(
				deleteExampleAction.type,
				handler.handler
			);
		});
	});
});
