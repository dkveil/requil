import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createExampleAction } from './create-example.handler';
import {
	CreateExampleResponse,
	createExampleBodySchema,
	createExampleResponseSchema,
} from './create-example.schema';

export default async function createExampleRoute(fastify: FastifyInstance) {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/examples',
		schema: {
			body: createExampleBodySchema,
			response: {
				201: createExampleResponseSchema,
			},
			tags: ['examples'],
		},
		handler: async (request, reply) => {
			const result = await fastify.commandBus.execute(
				createExampleAction(request.body)
			);

			return reply.code(201).send(result as CreateExampleResponse);
		},
	});
}
