import { db } from '@requil/db';
import { asValue } from 'awilix';
import type { FastifyBaseLogger } from 'fastify';
import type { CommandBus, EventBus } from '@/shared/cqrs/bus.types';
import type { DBType, RepositoryBaseProps } from '@/shared/db/repository.base';
import { RepositoryBase } from '@/shared/db/repository.base';
import type { RepositoryPort } from '@/shared/db/repository.port';

declare global {
	export interface Dependencies {
		logger: FastifyBaseLogger;
		queryBus: CommandBus;
		commandBus: CommandBus;
		eventBus: EventBus;
		db: DBType;
		repositoryBase: <Entity, PersistenceModel>(
			props: Omit<
				RepositoryBaseProps<Entity, PersistenceModel>,
				'logger' | 'db'
			>
		) => RepositoryPort<Entity, string>;
	}
}

export function makeDependencies({
	logger,
	queryBus,
	commandBus,
	eventBus,
}: {
	logger: FastifyBaseLogger;
	commandBus: CommandBus;
	eventBus: EventBus;
	queryBus: CommandBus;
}) {
	const repositoryBaseFn = <
		Entity,
		PersistenceModel extends Record<string, unknown>,
	>(
		props: Omit<RepositoryBaseProps<Entity, PersistenceModel>, 'logger' | 'db'>
	) =>
		RepositoryBase<Entity, PersistenceModel>({
			logger,
			db,
			...props,
		});

	return {
		logger: asValue(logger),
		db: asValue(db),
		repositoryBase: asValue(repositoryBaseFn),
		commandBus: asValue(commandBus),
		queryBus: asValue(queryBus),
		eventBus: asValue(eventBus),
	};
}
