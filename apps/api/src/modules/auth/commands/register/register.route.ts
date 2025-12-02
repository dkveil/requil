import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	type RegisterResponse,
	registerInputSchema,
	registerResponseSchema,
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { registerAction } from './register.handler';

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
			const result = await fastify.commandBus.execute<RegisterResponse>(
				registerAction(request.body)
			);
			return sendSuccess(reply, result, 201);
		},
	});
};

export default registerRoute;
