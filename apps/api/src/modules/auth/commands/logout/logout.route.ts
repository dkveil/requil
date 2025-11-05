import { errorResponseSchema, successResponseSchema } from '@requil/types/api';
import { logoutResponseSchema } from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { logoutHandler } from './logout.handler';

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
			const result = await logoutHandler(token, fastify.supabase);

			reply
				.clearCookie('requil_access_token', { path: '/' })
				.clearCookie('requil_refresh_token', { path: '/' });

			return sendSuccess(reply, result);
		},
	});
};

export default logoutRoute;
