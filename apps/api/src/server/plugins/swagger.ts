import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '@/config';

async function swaggerGeneratorPlugin(fastify: FastifyInstance) {
	await fastify.register(Swagger, {
		openapi: {
			openapi: '3.1.0',
			info: {
				title: 'Requil API',
				version: env.version ?? '0.0.0',
			},
		},
	});

	await fastify.register(SwaggerUI, {
		routePrefix: '/api-docs',
	});

	fastify.log.info(`Swagger documentation is available at /api-docs`);
}

export default fp(swaggerGeneratorPlugin, {
	name: 'swagger-generator',
});
