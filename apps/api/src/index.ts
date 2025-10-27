import Fastify from 'fastify';
import server from '@/server';

async function init() {
	const fastify = Fastify();

	await server(fastify);

	await fastify.listen({ port: 3000 });
}

init();
