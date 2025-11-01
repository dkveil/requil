import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getSessionResponseSchema } from './get-session.schema';

const getSessionRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: '/auth/session',
		onRequest: [fastify.authenticate],
		schema: {
			headers: z.object({
				authorization: z.string(),
			}),
			response: {
				200: getSessionResponseSchema,
        401: z.object({
          error: z.string(),
          message: z.string(),
        }),
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			if (!request.supabaseUser) {
				return reply.code(401).send({
					error: 'Unauthorized',
					message: 'Authentication required',
				});
			}

			return reply.send({
				user: {
					id: request.supabaseUser.id,
					email: request.supabaseUser.email,
				},
			});
		},
	});
};

export default getSessionRoute;

