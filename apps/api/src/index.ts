import { randomUUID } from 'node:crypto';
import GracefulServer from '@gquittet/graceful-server';
import Fastify from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import server from '@/server';
import { env } from './config';
import { closeConnection } from './shared/db/postgres';

async function init() {
	const fastify = Fastify({
		logger: {
			level: env.log.level,
			redact: ['req.headers.authorization'],
		},
		genReqId: (req) => {
			// header best practice: don't use "x-" https://www.rfc-editor.org/info/rfc6648 and keep it lowercase
			return (req.headers['request-id'] as string) ?? randomUUID();
		},
	}).withTypeProvider<ZodTypeProvider>();

	await server(fastify);

	const gracefulServer = GracefulServer(fastify.server, {
		closePromises: [closeConnection],
	});

	gracefulServer.on(GracefulServer.READY, () => {
		fastify.log.info('Server is ready');
	});

	gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
		fastify.log.info('Server is shutting down');
	});

	gracefulServer.on(GracefulServer.SHUTDOWN, (error) => {
		fastify.log.info('Server is down because of', error.message);
	});

	try {
		await fastify.listen({
			host: env.server.host,
			port: env.server.port,
		});
		gracefulServer.setReady();
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
}

init();
