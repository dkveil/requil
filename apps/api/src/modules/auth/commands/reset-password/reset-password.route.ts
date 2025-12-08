import { errorResponseSchema, successResponseSchema } from '@requil/types';
import type { ResetPasswordResponse } from '@requil/types/auth';
import {
	resetPasswordInputSchema,
	resetPasswordResponseSchema,
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { resetPasswordAction } from './reset-password.handler';

const resetPasswordRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.AUTH.RESET_PASSWORD,
		schema: {
			body: resetPasswordInputSchema,
			response: {
				200: successResponseSchema(resetPasswordResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
			},
			tags: ['auth'],
			description: 'Reset password with recovery session',
		},
		handler: async (request, reply) => {
			const result = await fastify.commandBus.execute<ResetPasswordResponse>(
				resetPasswordAction(request.body)
			);

			return sendSuccess(reply, result);
		},
	});
};

export default resetPasswordRoute;
