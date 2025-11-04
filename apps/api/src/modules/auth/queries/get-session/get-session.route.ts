import { ERROR_CODES } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { getSessionResponseSchema } from '@requil/types/auth';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

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
				401: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			if (!request.supabaseUser) {
				return reply.code(401).send({
					error: {
						message: 'Authentication required',
						code: ERROR_CODES.AUTHENTICATION_ERROR,
					},
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
