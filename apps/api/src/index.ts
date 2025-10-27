import Fastify from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import server from '@/server';

async function init() {
	const fastify = Fastify().withTypeProvider<ZodTypeProvider>();

	await server(fastify);

	await fastify.listen({ port: 3000 });
}

init();
