import type { ExampleEntity } from './domain/example.domain';
import type { ExampleResponseDto } from './dto/example.response.dto';

export const toDto = (entity: ExampleEntity): ExampleResponseDto => ({
	id: entity.id,
	name: entity.name,
	createdAt: entity.createdAt.toISOString(),
	updatedAt: entity.updatedAt.toISOString(),
});

export const toDtoList = (entities: ExampleEntity[]): ExampleResponseDto[] =>
	entities.map(toDto);
