import { errorResponseSchema } from '@requil/types/api';
import {
	registerInputSchema,
	registerResponseSchema,
} from '@requil/types/auth';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerHandler } from './register.handler';

const registerRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/register',
		schema: {
			body: registerInputSchema,
			response: {
				201: registerResponseSchema,
				400: errorResponseSchema,
				409: errorResponseSchema,
				429: errorResponseSchema,
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
