import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExampleEntity } from '../../../domain/example.domain';
import {
	ExampleAlreadyExistsError,
	ExampleValidationError,
} from '../../../domain/example.error';
import createExampleHandler, {
	createExampleAction,
} from '../create-example.handler';

describe('CreateExampleHandler', () => {
	let handler: ReturnType<typeof createExampleHandler>;

	const mockCommandBus = {
		register: vi.fn(),
	};

	const mockExampleRepository = {
		existsByName: vi.fn(),
		create: vi.fn(),
	};

	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		handler = createExampleHandler({
			commandBus: mockCommandBus,
			exampleRepository: mockExampleRepository,
			logger: mockLogger,
		} as unknown as Dependencies);
	});

	describe('handler', () => {
		it('should create example successfully', async () => {
			const name = 'Test Example';
			mockExampleRepository.existsByName.mockResolvedValue(false);
			mockExampleRepository.create.mockResolvedValue(undefined);

			const action = createExampleAction({ name });
			const result = await handler.handler(action);

			expect(mockExampleRepository.existsByName).toHaveBeenCalledWith(name);
			expect(mockExampleRepository.create).toHaveBeenCalledWith(
				expect.any(ExampleEntity)
			);
			expect(mockLogger.info).toHaveBeenCalledWith(
				{ payload: { name } },
				'Creating example'
			);
			expect(result).toEqual({
				id: expect.any(String),
				name,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});

		it('should throw error when example already exists', async () => {
			const name = 'Existing Example';
			mockExampleRepository.existsByName.mockResolvedValue(true);

			const action = createExampleAction({ name });

			await expect(handler.handler(action)).rejects.toThrow(
				ExampleAlreadyExistsError
			);
			await expect(handler.handler(action)).rejects.toThrow(
				`Example with name "${name}" already exists`
			);
			expect(mockExampleRepository.create).not.toHaveBeenCalled();
		});

		it('should throw validation error for invalid name', async () => {
			const name = 'ab';
			mockExampleRepository.existsByName.mockResolvedValue(false);

			const action = createExampleAction({ name });

			await expect(handler.handler(action)).rejects.toThrow(
				ExampleValidationError
			);
			expect(mockExampleRepository.create).not.toHaveBeenCalled();
		});

		it('should trim whitespace from name', async () => {
			const name = '  Test Example  ';
			mockExampleRepository.existsByName.mockResolvedValue(false);
			mockExampleRepository.create.mockResolvedValue(undefined);

			const action = createExampleAction({ name });
			const result = await handler.handler(action);

			expect(result.name).toBe('Test Example');
		});
	});

	describe('init', () => {
		it('should register handler in command bus', async () => {
			await handler.init();

			expect(mockCommandBus.register).toHaveBeenCalledWith(
				createExampleAction.type,
				handler.handler
			);
		});
	});
});
