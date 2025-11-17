import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	loginResponseSchema,
	oauthCallbackInputSchema,
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@/config';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { oauthCallbackHandler } from './ouath-callback.handler';

const ouathCallbackRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.AUTH.OAUTH_CALLBACK,
		schema: {
			querystring: oauthCallbackInputSchema,
			response: {
				200: successResponseSchema(loginResponseSchema),
				400: errorResponseSchema,
				500: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await oauthCallbackHandler(
				request.query,
				fastify.supabase,
				request.diScope.cradle as Dependencies
			);

			reply
				.setCookie('requil_access_token', result.accessToken, {
					httpOnly: true,
					secure: env.isProduction,
					sameSite: env.isProduction ? 'none' : 'lax',
					path: '/',
					maxAge: result.expiresIn,
					domain: env.isProduction ? '.requil.app' : undefined,
				})
				.setCookie('requil_refresh_token', result.refreshToken, {
					httpOnly: true,
					secure: env.isProduction,
					sameSite: env.isProduction ? 'none' : 'lax',
					path: '/',
					maxAge: 60 * 60 * 24 * 7,
					domain: env.isProduction ? '.requil.app' : undefined,
				});

			return sendSuccess(reply, result);
		},
	});
};

export default ouathCallbackRoute;
