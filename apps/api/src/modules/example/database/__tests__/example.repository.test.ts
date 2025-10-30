import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExampleEntity } from '../../domain/example.domain';
import exampleRepository from '../example.repository';

describe('ExampleRepository', () => {
	let repository: ReturnType<typeof exampleRepository>;

	const mockDb = {
		query: {
			example: {
				findFirst: vi.fn(),
			},
		},
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([]),
	};

	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
	};

	const mockBaseRepo = {
		create: vi.fn(),
		findOneById: vi.fn(),
		delete: vi.fn(),
		findAll: vi.fn(),
		findAllPaginated: vi.fn(),
	};

	const mockRepositoryBase = vi.fn().mockReturnValue(mockBaseRepo);

	beforeEach(() => {
		vi.clearAllMocks();

		repository = exampleRepository({
			db: mockDb,
			logger: mockLogger,
			repositoryBase: mockRepositoryBase,
		} as unknown as Dependencies);
	});

	describe('findByName', () => {
		it('should find example by name', async () => {
			const mockData = {
				id: 'test-id',
				name: 'Test Example',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockDb.query.example.findFirst.mockResolvedValue(mockData);

			const result = await repository.findByName('Test Example');

			expect(result).toBeInstanceOf(ExampleEntity);
			expect(result?.name).toBe('Test Example');
			expect(mockDb.query.example.findFirst).toHaveBeenCalled();
		});

		it('should return undefined when example not found', async () => {
			mockDb.query.example.findFirst.mockResolvedValue(undefined);

			const result = await repository.findByName('Non-existent');

			expect(result).toBeUndefined();
		});

		it('should handle database errors', async () => {
			mockDb.query.example.findFirst.mockRejectedValue(
				new Error('Database error')
			);

			await expect(repository.findByName('Test')).rejects.toThrow(
				'Database error'
			);
		});
	});

	describe('existsByName', () => {
		it('should return true when example exists', async () => {
			mockDb.limit.mockResolvedValue([{ exists: 1 }]);

			const result = await repository.existsByName('Existing Example');

			expect(result).toBe(true);
		});

		it('should return false when example does not exist', async () => {
			mockDb.limit.mockResolvedValue([]);

			const result = await repository.existsByName('Non-existent Example');

			expect(result).toBe(false);
		});

		it('should handle database errors', async () => {
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			await expect(repository.existsByName('Test')).rejects.toThrow(
				'Database error'
			);
		});
	});

	describe('base repository methods', () => {
		it('should expose create method from base repository', () => {
			expect(repository.create).toBeDefined();
			expect(typeof repository.create).toBe('function');
		});

		it('should expose findOneById method from base repository', () => {
			expect(repository.findOneById).toBeDefined();
			expect(typeof repository.findOneById).toBe('function');
		});

		it('should expose delete method from base repository', () => {
			expect(repository.delete).toBeDefined();
			expect(typeof repository.delete).toBe('function');
		});

		it('should expose findAll method from base repository', () => {
			expect(repository.findAll).toBeDefined();
			expect(typeof repository.findAll).toBe('function');
		});

		it('should expose findAllPaginated method from base repository', () => {
			expect(repository.findAllPaginated).toBeDefined();
			expect(typeof repository.findAllPaginated).toBe('function');
		});
	});
});
