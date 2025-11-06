import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	registerInputSchema,
	registerResponseSchema,
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { registerHandler } from './register.handler';

const registerRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.AUTH.REGISTER,
		schema: {
			body: registerInputSchema,
			response: {
				201: successResponseSchema(registerResponseSchema),
				400: errorResponseSchema,
				409: errorResponseSchema,
				429: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await registerHandler(
				request.body,
				fastify.supabase,
				request.diScope.cradle as Dependencies
			);
			return sendSuccess(reply, result, 201);
		},
	});
};

export default registerRoute;
