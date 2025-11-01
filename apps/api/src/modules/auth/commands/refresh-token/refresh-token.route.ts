import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { refreshTokenHandler } from './refresh-token.handler';
import {
	refreshTokenResponseSchema,
	refreshTokenSchema,
} from './refresh-token.schema';

const refreshTokenRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/refresh',
		schema: {
			body: refreshTokenSchema,
			response: {
				200: refreshTokenResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await refreshTokenHandler(request.body, fastify.supabase);
			return reply.send(result);
		},
	});
};

export default refreshTokenRoute;


