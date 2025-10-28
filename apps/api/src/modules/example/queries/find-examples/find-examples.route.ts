import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { findExamplesAction } from './find-examples.handler';
import {
	FindExamplesResponse,
	findExamplesQuerySchema,
	findExamplesResponseSchema,
} from './find-examples.schema';

export default async function findExamplesRoute(fastify: FastifyInstance) {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: '/examples',
		schema: {
			querystring: findExamplesQuerySchema,
			response: {
				200: findExamplesResponseSchema,
			},
			tags: ['examples'],
		},
		handler: async (request, reply) => {
			const result = await fastify.queryBus.execute(
				findExamplesAction(request.query)
			);

			return reply.code(200).send(result as FindExamplesResponse);
		},
	});
}
