import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { deleteExampleAction } from './delete-example.handler';

const deleteExampleParamsSchema = z.object({
	id: z.string().uuid(),
});

export default async function deleteExampleRoute(fastify: FastifyInstance) {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'DELETE',
		url: '/examples/:id',
		schema: {
			params: deleteExampleParamsSchema,
			response: {
				204: z.void(),
			},
			tags: ['examples'],
			description: 'Delete an example by ID',
		},
		handler: async (request, reply) => {
			await fastify.commandBus.execute(
				deleteExampleAction({ id: request.params.id })
			);

			return reply.code(204).send();
		},
	});
}
