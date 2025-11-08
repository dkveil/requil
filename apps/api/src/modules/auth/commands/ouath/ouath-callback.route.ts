import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	loginResponseSchema,
	oauthCallbackInputSchema,
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { oauthCallbackHandler } from './ouath-callback.handler';

const ouathCallbackRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.AUTH.OAUTH_CALLBACK,
		schema: {
			body: oauthCallbackInputSchema,
			response: {
				200: successResponseSchema(loginResponseSchema),
				400: errorResponseSchema,
				500: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await oauthCallbackHandler(
				request.body,
				fastify.supabase,
				request.diScope.cradle as Dependencies
			);
			return sendSuccess(reply, result);
		},
	});
};

export default ouathCallbackRoute;
