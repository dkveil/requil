import Cors from '@fastify/cors';
import { FastifySensibleOptions } from '@fastify/sensible';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function corsPlugin(fastify: FastifyInstance) {
	fastify.register(Cors, {
		origin: '*',
	});
}

export default fp<FastifySensibleOptions>(corsPlugin, {
	name: 'cors',
});
