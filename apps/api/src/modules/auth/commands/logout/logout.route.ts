import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { logoutHandler } from './logout.handler';
import { logoutResponseSchema } from './logout.schema';

const logoutRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/logout',
		onRequest: [fastify.authenticate],
		schema: {
			headers: z.object({
				authorization: z.string(),
			}),
			response: {
				200: logoutResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const token = request.headers.authorization?.substring(7) || '';
			const result = await logoutHandler(token, fastify.supabase);
			return reply.send(result);
		},
	});
};

export default logoutRoute;


