import Cors from '@fastify/cors';
import { FastifySensibleOptions } from '@fastify/sensible';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '@/config';

async function corsPlugin(fastify: FastifyInstance) {
	const allowedOrigins = env.cors;

	fastify.log.info({ allowedOrigins }, 'Configuring CORS');

	fastify.register(Cors, {
		origin: allowedOrigins.length > 0 ? allowedOrigins : false,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
		exposedHeaders: ['Set-Cookie'],
	});
}

export default fp<FastifySensibleOptions>(corsPlugin, {
	name: 'cors',
});