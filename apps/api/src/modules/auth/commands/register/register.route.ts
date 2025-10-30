import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerHandler } from './register.handler';
import { registerResponseSchema, registerSchema } from './register.schema';

const registerRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/register',
		schema: {
			body: registerSchema,
			response: {
				201: registerResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await registerHandler(request.body, fastify.supabase);
			return reply.code(201).send(result);
		},
	});
};

export default registerRoute;
