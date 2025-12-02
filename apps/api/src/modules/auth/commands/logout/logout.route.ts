import { errorResponseSchema, successResponseSchema } from '@requil/types/api';
import { type LogoutResponse, logoutResponseSchema } from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@/config';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { logoutAction } from './logout.handler';

const logoutRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.AUTH.LOGOUT,
		onRequest: [fastify.authenticate],
		schema: {
			response: {
				200: successResponseSchema(logoutResponseSchema),
				401: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const token = request.cookies.requil_access_token || '';

			const result = await fastify.commandBus.execute<LogoutResponse>(
				logoutAction({ accessToken: token })
			);

			reply
				.clearCookie('requil_access_token', {
					path: '/',
					domain: env.isProduction ? '.requil.app' : undefined,
					secure: env.isProduction,
					sameSite: env.isProduction ? 'none' : 'lax',
				})
				.clearCookie('requil_refresh_token', {
					path: '/',
					domain: env.isProduction ? '.requil.app' : undefined,
					secure: env.isProduction,
					sameSite: env.isProduction ? 'none' : 'lax',
				});

			return sendSuccess(reply, result);
		},
	});
};

export default logoutRoute;
