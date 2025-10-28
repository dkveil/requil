import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { IExampleRepository } from './database/example.repository.port';
import { ExampleEntity } from './domain/example.domain';
import { ExampleResponseDto } from './dto/example.response.dto';

declare global {
	export interface Dependencies {
		exampleRepository: IExampleRepository;
		exampleMapper: { toDto: (entity: ExampleEntity) => ExampleResponseDto };
	}
}

export const exampleActionCreator = actionCreatorFactory('example');
