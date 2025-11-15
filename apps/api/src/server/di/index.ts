import path from 'node:path';
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asFunction, Lifetime } from 'awilix';
import { FastifyInstance } from 'fastify';
import { makeDependencies } from '@/modules';
import { formatName } from '@/server/di/util';

export async function di(fastify: FastifyInstance) {
	const config = await import('@/config');

	diContainer
		.register({
			...makeDependencies({
				logger: fastify.log,
				commandBus: fastify.commandBus,
				eventBus: fastify.eventBus,
				queryBus: fastify.queryBus,
				config: { env: config.env as any },
				supabase: fastify.supabase,
			}),
		})
		.loadModules(
			[
				path.join(
					__dirname,
					'../../modules/**/*.{repository,mapper,service,domain}.{js,ts}'
				),
			],
			{
				formatName,
				resolverOptions: {
					register: asFunction,
					lifetime: Lifetime.SINGLETON,
				},
			}
		)
		.loadModules(
			[
				path.join(
					__dirname,
					'../../modules/**/*.{handler,event-handler}.{js,ts}'
				),
			],
			{
				formatName,
				resolverOptions: {
					asyncInit: 'init',
					register: asFunction,
					lifetime: Lifetime.SINGLETON,
				},
			}
		);

	fastify.log.info(
		{ handlers: Object.keys(diContainer.registrations) },
		'Loaded DI registrations'
	);

	await fastify.register(fastifyAwilixPlugin, {
		container: diContainer,
		asyncInit: true,
	});
}
