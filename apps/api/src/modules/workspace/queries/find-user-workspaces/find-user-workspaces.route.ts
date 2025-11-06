import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { findUserWorkspacesResponseSchema } from '@requil/types/workspace';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { findUserWorkspacesAction } from './find-user-workspaces.handler';

const findUserWorkspacesRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.WORKSPACE.LIST,
		schema: {
			response: {
				200: successResponseSchema(findUserWorkspacesResponseSchema),
				401: errorResponseSchema,
			},
			tags: ['workspace'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.queryBus.execute(
				findUserWorkspacesAction(undefined, { userId })
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default findUserWorkspacesRoute;
