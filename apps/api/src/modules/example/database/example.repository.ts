// apps/api/src/modules/example/database/example.repository.ts

import { type Example, example } from '@requil/db';
import { eq, sql } from 'drizzle-orm';
import { ExampleEntity } from '../domain/example.domain';
import type { IExampleRepository } from './example.repository.port';

export default function exampleRepository({
	db,
	logger,
	repositoryBase,
}: Dependencies): IExampleRepository {
	const baseRepository = repositoryBase<ExampleEntity, Example>({
		table: example,
		mapper: {
			toPersistence: (entity: ExampleEntity) => entity.toPersistence(),
			toDomain: (model: Example) => ExampleEntity.fromPersistence(model),
		},
	});

	const findByName = async (
		name: string
	): Promise<ExampleEntity | undefined> => {
		const result = await db.query.example.findFirst({
			where: eq(example.name, name),
		});

		return result ? ExampleEntity.fromPersistence(result) : undefined;
	};

	const existsByName = async (name: string): Promise<boolean> => {
		const result = await db
			.select({ exists: sql<boolean>`1` })
			.from(example)
			.where(eq(example.name, name))
			.limit(1);

		return result.length > 0;
	};

	return {
		...baseRepository,
		findByName,
		existsByName,
	};
}
