import { describe, expect, it } from 'vitest';
import { ExampleEntity } from '../example.domain';
import { ExampleValidationError } from '../example.error';

describe('ExampleEntity', () => {
	describe('create', () => {
		it('should create a valid example entity', () => {
			const name = 'Test Example';
			const entity = ExampleEntity.create({ name });

			expect(entity.id).toBeDefined();
			expect(entity.name).toBe(name);
			expect(entity.createdAt).toBeInstanceOf(Date);
			expect(entity.updatedAt).toBeInstanceOf(Date);
		});

		it('should trim whitespace from name', () => {
			const entity = ExampleEntity.create({ name: '  Test Example  ' });
			expect(entity.name).toBe('Test Example');
		});

		it('should throw error when name is empty', () => {
			expect(() => ExampleEntity.create({ name: '' })).toThrow(
				ExampleValidationError
			);
			expect(() => ExampleEntity.create({ name: '' })).toThrow(
				'Name cannot be empty'
			);
		});

		it('should throw error when name is only whitespace', () => {
			expect(() => ExampleEntity.create({ name: '   ' })).toThrow(
				ExampleValidationError
			);
		});

		it('should throw error when name is too short', () => {
			expect(() => ExampleEntity.create({ name: 'ab' })).toThrow(
				ExampleValidationError
			);
			expect(() => ExampleEntity.create({ name: 'ab' })).toThrow(
				'Name must be at least 3 characters long'
			);
		});

		it('should throw error when name is too long', () => {
			const longName = 'a'.repeat(101);
			expect(() => ExampleEntity.create({ name: longName })).toThrow(
				ExampleValidationError
			);
			expect(() => ExampleEntity.create({ name: longName })).toThrow(
				'Name must be at most 100 characters long'
			);
		});

		it('should accept name with exactly 3 characters', () => {
			const entity = ExampleEntity.create({ name: 'abc' });
			expect(entity.name).toBe('abc');
		});

		it('should accept name with exactly 100 characters', () => {
			const name = 'a'.repeat(100);
			const entity = ExampleEntity.create({ name });
			expect(entity.name).toBe(name);
		});
	});

	describe('fromPersistence', () => {
		it('should create entity from persistence model', () => {
			const persistenceModel = {
				id: 'test-id',
				name: 'Test Example',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-02'),
			};

			const entity = ExampleEntity.fromPersistence(persistenceModel);

			expect(entity.id).toBe(persistenceModel.id);
			expect(entity.name).toBe(persistenceModel.name);
			expect(entity.createdAt).toEqual(persistenceModel.createdAt);
			expect(entity.updatedAt).toEqual(persistenceModel.updatedAt);
		});
	});

	describe('updateName', () => {
		it('should update name successfully', () => {
			const entity = ExampleEntity.create({ name: 'Original Name' });
			const originalUpdatedAt = entity.updatedAt;

			entity.updateName('New Name');

			expect(entity.name).toBe('New Name');
			expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(
				originalUpdatedAt.getTime()
			);
		});

		it('should trim whitespace when updating name', () => {
			const entity = ExampleEntity.create({ name: 'Original Name' });
			entity.updateName('  New Name  ');
			expect(entity.name).toBe('New Name');
		});

		it('should throw error when updating to invalid name', () => {
			const entity = ExampleEntity.create({ name: 'Original Name' });
			expect(() => entity.updateName('')).toThrow(ExampleValidationError);
			expect(() => entity.updateName('ab')).toThrow(ExampleValidationError);
			expect(() => entity.updateName('a'.repeat(101))).toThrow(
				ExampleValidationError
			);
		});
	});

	describe('toPersistence', () => {
		it('should convert entity to persistence model', () => {
			const entity = ExampleEntity.create({ name: 'Test Example' });
			const persistence = entity.toPersistence();

			expect(persistence).toEqual({
				id: entity.id,
				name: entity.name,
				createdAt: entity.createdAt,
				updatedAt: entity.updatedAt,
			});
		});
	});
});
