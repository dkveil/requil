import { ERROR_CODES, successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { getSessionResponseSchema } from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendError, sendSuccess } from '@/shared/app/response-wrapper';

const getSessionRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.AUTH.SESSION,
		onRequest: [fastify.authenticate],
		schema: {
			response: {
				200: successResponseSchema(getSessionResponseSchema),
				401: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			if (!request.supabaseUser) {
				return sendError(
					reply,
					{
						message: 'Authentication required',
						code: ERROR_CODES.AUTHENTICATION_ERROR,
					},
					401
				);
			}

			return sendSuccess(
				reply,
				{
					user: {
						id: request.supabaseUser.id,
						email: request.supabaseUser.email || '',
					},
				},
				200
			);
		},
	});
};

export default getSessionRoute;
