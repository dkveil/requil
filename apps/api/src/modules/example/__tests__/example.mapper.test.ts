import { describe, expect, it } from 'vitest';
import { ExampleEntity } from '../domain/example.domain';
import { toDto, toDtoList } from '../example.mapper';

describe('Example Mapper', () => {
	describe('toDto', () => {
		it('should convert entity to DTO', () => {
			const entity = ExampleEntity.create({ name: 'Test Example' });
			const dto = toDto(entity);

			expect(dto).toEqual({
				id: entity.id,
				name: entity.name,
				createdAt: entity.createdAt.toISOString(),
				updatedAt: entity.updatedAt.toISOString(),
			});
		});

		it('should format dates as ISO strings', () => {
			const entity = ExampleEntity.fromPersistence({
				id: 'test-id',
				name: 'Test Example',
				createdAt: new Date('2024-01-01T10:00:00Z'),
				updatedAt: new Date('2024-01-02T15:30:00Z'),
			});

			const dto = toDto(entity);

			expect(dto.createdAt).toBe('2024-01-01T10:00:00.000Z');
			expect(dto.updatedAt).toBe('2024-01-02T15:30:00.000Z');
		});
	});

	describe('toDtoList', () => {
		it('should convert array of entities to DTOs', () => {
			const entities = [
				ExampleEntity.create({ name: 'Example 1' }),
				ExampleEntity.create({ name: 'Example 2' }),
				ExampleEntity.create({ name: 'Example 3' }),
			];

			const dtos = toDtoList(entities);

			expect(dtos).toHaveLength(3);
			expect(dtos[0]?.name).toBe('Example 1');
			expect(dtos[1]?.name).toBe('Example 2');
			expect(dtos[2]?.name).toBe('Example 3');
		});

		it('should return empty array for empty input', () => {
			const dtos = toDtoList([]);
			expect(dtos).toEqual([]);
		});
	});
});
