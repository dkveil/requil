import Cors from '@fastify/cors';
import { FastifySensibleOptions } from '@fastify/sensible';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function corsPlugin(fastify: FastifyInstance) {
	const allowedOrigins = ['http://localhost:5137', 'http://localhost:3000'];

	fastify.register(Cors, {
		origin: allowedOrigins,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
	});
}

export default fp<FastifySensibleOptions>(corsPlugin, {
	name: 'cors',
});
