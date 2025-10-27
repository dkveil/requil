import path from 'node:path';
import AutoLoad from '@fastify/autoload';
import { FastifyInstance } from 'fastify';

export default async function createServer(fastify: FastifyInstance) {
	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, 'plugins'),
		dirNameRoutePrefix: false,
	});
}
