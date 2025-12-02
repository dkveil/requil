import {
	GetOAuthUrlResponse,
	getOAuthUrlInputSchema,
	getOAuthUrlResponseSchema,
	successResponseSchema,
} from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { API_ROUTES } from '@requil/utils/api-routes';
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { getOAuthUrlAction } from './ouath.handler';

const oauthRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.AUTH.OAUTH,
		schema: {
			querystring: getOAuthUrlInputSchema,
			tags: ['auth'],
			response: {
				200: successResponseSchema(getOAuthUrlResponseSchema),
				400: errorResponseSchema,
				500: errorResponseSchema,
			},
		},
		handler: async (request, reply) => {
			const result = await fastify.commandBus.execute<GetOAuthUrlResponse>(
				getOAuthUrlAction(request.query)
			);
			return sendSuccess(reply, result);
		},
	});
};

export default oauthRoute;
