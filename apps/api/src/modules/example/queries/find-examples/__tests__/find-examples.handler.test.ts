import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExampleEntity } from '../../../domain/example.domain';
import findExamplesHandler, {
	findExamplesAction,
} from '../find-examples.handler';

describe('FindExamplesHandler', () => {
	let handler: ReturnType<typeof findExamplesHandler>;

	const mockQueryBus = {
		register: vi.fn(),
	};

	const mockExampleRepository = {
		findAllPaginated: vi.fn(),
	};

	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		handler = findExamplesHandler({
			queryBus: mockQueryBus,
			exampleRepository: mockExampleRepository,
			logger: mockLogger,
		} as unknown as Dependencies);
	});

	describe('handler', () => {
		it('should find examples with pagination', async () => {
			const page = 0;
			const limit = 10;
			const orderBy = 'createdAt';
			const orderDirection = 'desc';

			const mockEntities = [
				ExampleEntity.create({ name: 'Example 1' }),
				ExampleEntity.create({ name: 'Example 2' }),
			];

			const mockResult = {
				data: mockEntities,
				pagination: {
					total: 2,
					page,
					limit,
					totalPages: 1,
				},
			};

			mockExampleRepository.findAllPaginated.mockResolvedValue(mockResult);

			const action = findExamplesAction({
				page,
				limit,
				orderBy,
				orderDirection,
			});
			const result = await handler.handler(action);

		expect(mockExampleRepository.findAllPaginated).toHaveBeenCalledWith({
			page,
			limit,
			offset: 0,
			orderBy: {
				field: orderBy,
				direction: orderDirection,
			},
		});

			expect(mockLogger.info).toHaveBeenCalledWith(
				{ page, limit, orderBy },
				'Finding examples'
			);

			expect(result.data).toHaveLength(2);
			expect(result.data[0]).toEqual({
				id: expect.any(String),
				name: 'Example 1',
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
			expect(result.pagination).toEqual(mockResult.pagination);
		});

		it('should calculate correct offset for page 1', async () => {
			const page = 1;
			const limit = 10;

			mockExampleRepository.findAllPaginated.mockResolvedValue({
				data: [],
				pagination: { total: 0, page, limit, totalPages: 0 },
			});

			const action = findExamplesAction({
				page,
				limit,
				orderBy: 'createdAt',
				orderDirection: 'desc',
			});
			await handler.handler(action);

		expect(mockExampleRepository.findAllPaginated).toHaveBeenCalledWith({
			page,
			limit,
			offset: 10,
			orderBy: {
				field: 'createdAt',
				direction: 'desc',
			},
		});
		});

		it('should calculate correct offset for page 2', async () => {
			const page = 2;
			const limit = 20;

			mockExampleRepository.findAllPaginated.mockResolvedValue({
				data: [],
				pagination: { total: 0, page, limit, totalPages: 0 },
			});

			const action = findExamplesAction({
				page,
				limit,
				orderBy: 'createdAt',
				orderDirection: 'asc',
			});
			await handler.handler(action);

		expect(mockExampleRepository.findAllPaginated).toHaveBeenCalledWith({
			page,
			limit,
			offset: 40,
			orderBy: {
				field: 'createdAt',
				direction: 'asc',
			},
		});
		});

		it('should return empty array when no examples found', async () => {
			mockExampleRepository.findAllPaginated.mockResolvedValue({
				data: [],
				pagination: {
					total: 0,
					page: 0,
					limit: 10,
					totalPages: 0,
				},
			});

			const action = findExamplesAction({
				page: 0,
				limit: 10,
				orderBy: 'createdAt',
				orderDirection: 'desc',
			});
			const result = await handler.handler(action);

			expect(result.data).toEqual([]);
			expect(result.pagination.total).toBe(0);
		});

		it('should handle different order directions', async () => {
			mockExampleRepository.findAllPaginated.mockResolvedValue({
				data: [],
				pagination: { total: 0, page: 0, limit: 10, totalPages: 0 },
			});

			const actionAsc = findExamplesAction({
				page: 0,
				limit: 10,
				orderBy: 'name',
				orderDirection: 'asc',
			});
			await handler.handler(actionAsc);

		expect(mockExampleRepository.findAllPaginated).toHaveBeenLastCalledWith({
			page: 0,
			limit: 10,
			offset: 0,
			orderBy: {
				field: 'name',
				direction: 'asc',
			},
		});
		});
	});

	describe('init', () => {
		it('should register handler in query bus', async () => {
			await handler.init();

			expect(mockQueryBus.register).toHaveBeenCalledWith(
				findExamplesAction.type,
				handler.handler
			);
		});
	});
});
