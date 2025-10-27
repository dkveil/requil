import Helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '@/config';

async function helmetPlugin(fastify: FastifyInstance) {
	fastify.register(Helmet, {
		global: true,
		contentSecurityPolicy: !env.isDevelopment,
		crossOriginEmbedderPolicy: !env.isDevelopment,
	});
}

export default fp(helmetPlugin, {
	name: 'helmet',
});
