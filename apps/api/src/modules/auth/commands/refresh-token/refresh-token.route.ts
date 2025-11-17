import { ERROR_CODES, successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { refreshTokenResponseSchema } from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@/config';
import { sendError, sendSuccess } from '@/shared/app/response-wrapper';
import { refreshTokenHandler } from './refresh-token.handler';

const refreshTokenRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.AUTH.REFRESH,
		schema: {
			response: {
				200: successResponseSchema(refreshTokenResponseSchema),
				401: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const refreshToken = request.cookies.requil_refresh_token;

			if (!refreshToken) {
				return sendError(
					reply,
					{
						message: 'No refresh token',
						code: ERROR_CODES.REFRESH_TOKEN_NOT_FOUND,
					},
					401
				);
			}

			const result = await refreshTokenHandler(
				{ refreshToken },
				fastify.supabase
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

export default refreshTokenRoute;
