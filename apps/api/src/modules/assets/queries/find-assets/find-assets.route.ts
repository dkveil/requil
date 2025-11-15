import {
	errorResponseSchema,
	findAssetsParamsSchema,
	findAssetsQuerySchema,
	findAssetsResponseSchema,
	successResponseSchema,
} from '@requil/types';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { findAssetsAction } from './find-assets.handler';

const findAssetsRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.ASSET.FIND,
		schema: {
			params: findAssetsParamsSchema,
			querystring: findAssetsQuerySchema,
			response: {
				200: successResponseSchema(findAssetsResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				403: errorResponseSchema,
			},
			tags: ['assets'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;
			const { workspaceId } = request.params;
			const query = request.query;

			const result = await fastify.queryBus.execute(
				findAssetsAction(
					{
						workspaceId,
						...query,
					},
					{ userId }
				)
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default findAssetsRoute;
