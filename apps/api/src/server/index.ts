import path from 'node:path';
import AutoLoad from '@fastify/autoload';
import UnderPressure from '@fastify/under-pressure';
import { FastifyInstance } from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import { env } from '@/config';
import { di } from '@/server/di';

const PRODUCTION_REGEX = /.(route|resolver).js$/;
const DEVELOPMENT_REGEX = /.(route|resolver).(ts|js)$/;

export default async function createServer(fastify: FastifyInstance) {
	fastify.setValidatorCompiler(validatorCompiler);
	fastify.setSerializerCompiler(serializerCompiler);

	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, 'plugins'),
		dirNameRoutePrefix: false,
	});

	await di(fastify);

	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, '../modules'),
		dirNameRoutePrefix: false,
		options: {
			prefix: 'api',
		},
		matchFilter: (path) => {
			const regex = env.isProduction ? PRODUCTION_REGEX : DEVELOPMENT_REGEX;
			return regex.test(path);
		},
	});

	await fastify.register(UnderPressure);
}
