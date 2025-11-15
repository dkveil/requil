import {
	deleteAssetParamsSchema,
	deleteAssetResponseSchema,
	errorResponseSchema,
	successResponseSchema,
} from '@requil/types';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { deleteAssetAction } from './delete-asset.handler';

const deleteAssetRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'DELETE',
		url: API_ROUTES.ASSET.DELETE,
		schema: {
			params: deleteAssetParamsSchema,
			response: {
				200: successResponseSchema(deleteAssetResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				403: errorResponseSchema,
				404: errorResponseSchema,
			},
			tags: ['assets'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;
			const { workspaceId, id } = request.params;

			const result = await fastify.commandBus.execute(
				deleteAssetAction(
					{
						id,
						workspaceId,
					},
					{ userId }
				)
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default deleteAssetRoute;
