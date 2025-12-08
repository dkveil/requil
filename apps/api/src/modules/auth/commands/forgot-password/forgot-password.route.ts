import { errorResponseSchema, successResponseSchema } from '@requil/types';
import type { ForgotPasswordResponse } from '@requil/types/auth';
import {
	forgotPasswordInputSchema,
	forgotPasswordResponseSchema,
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { forgotPasswordAction } from './forgot-password.handler';

const forgotPasswordRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.AUTH.FORGOT_PASSWORD,
		schema: {
			body: forgotPasswordInputSchema,
			response: {
				200: successResponseSchema(forgotPasswordResponseSchema),
				400: errorResponseSchema,
				429: errorResponseSchema,
			},
			tags: ['auth'],
			description: 'Request password reset email',
		},
		handler: async (request, reply) => {
			const result = await fastify.commandBus.execute<ForgotPasswordResponse>(
				forgotPasswordAction(request.body)
			);

			return sendSuccess(reply, result);
		},
	});
};

export default forgotPasswordRoute;
