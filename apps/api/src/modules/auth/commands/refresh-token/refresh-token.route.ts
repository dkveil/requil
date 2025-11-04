import { ERROR_CODES } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { refreshTokenResponseSchema } from '@requil/types/auth';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { refreshTokenHandler } from './refresh-token.handler';

const refreshTokenRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/refresh',
		schema: {
			response: {
				200: refreshTokenResponseSchema,
				401: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const refreshToken = request.cookies.requil_refresh_token;

			if (!refreshToken) {
				return reply.code(401).send({
					error: {
						message: 'No refresh token',
						code: ERROR_CODES.REFRESH_TOKEN_NOT_FOUND,
					},
				});
			}

			const result = await refreshTokenHandler(
				{ refreshToken },
				fastify.supabase
			);

			reply
				.setCookie('requil_access_token', result.accessToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: result.expiresIn,
				})
				.setCookie('requil_refresh_token', result.refreshToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: 60 * 60 * 24 * 7,
				});

			return reply.send(result);
		},
	});
};

export default refreshTokenRoute;
