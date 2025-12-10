import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	updateWorkspaceResponseSchema,
	updateWorkspaceSchema,
} from '@requil/types/workspace';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { updateWorkspaceAction } from './update-workspace.handler';

const updateWorkspaceRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'PATCH',
		url: API_ROUTES.WORKSPACE.LIST,
		schema: {
			body: updateWorkspaceSchema,
			response: {
				200: successResponseSchema(updateWorkspaceResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				403: errorResponseSchema,
				404: errorResponseSchema,
				409: errorResponseSchema,
			},
			tags: ['workspace'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.commandBus.execute(
				updateWorkspaceAction(request.body, { userId })
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default updateWorkspaceRoute;
