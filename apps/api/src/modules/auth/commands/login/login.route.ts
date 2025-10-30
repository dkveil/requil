import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginHandler } from './login.handler';
import { loginResponseSchema, loginSchema } from './login.schema';

const loginRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/login',
		schema: {
			body: loginSchema,
			response: {
				200: loginResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await loginHandler(request.body, fastify.supabase);
			return reply.send(result);
		},
	});
};

export default loginRoute;
