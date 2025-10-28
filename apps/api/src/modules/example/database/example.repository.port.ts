import type { RepositoryPort } from '@/shared/db/repository.port';
import type { ExampleEntity } from '../domain/example.domain';
import type { ExampleId } from '../domain/example.type';

export interface IExampleRepository
	extends RepositoryPort<ExampleEntity, ExampleId> {
	findByName(name: string): Promise<ExampleEntity | undefined>;
	existsByName(name: string): Promise<boolean>;
}
