import { errorResponseSchema } from '@requil/types/api';
import { logoutResponseSchema } from '@requil/types/auth';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { logoutHandler } from './logout.handler';

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
				401: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const token = request.headers.authorization?.substring(7) || '';
			const result = await logoutHandler(token, fastify.supabase);

			reply
				.clearCookie('requil_access_token', { path: '/' })
				.clearCookie('requil_refresh_token', { path: '/' });

			return reply.send(result);
		},
	});
};

export default logoutRoute;
