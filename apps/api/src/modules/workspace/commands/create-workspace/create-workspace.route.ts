import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	createWorkspaceResponseSchema,
	createWorkspaceSchema,
} from '@requil/types/workspace';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { createWorkspaceAction } from './create-workspace.handler';

const createWorkspaceRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.WORKSPACE.CREATE,
		schema: {
			body: createWorkspaceSchema,
			response: {
				201: successResponseSchema(createWorkspaceResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				409: errorResponseSchema,
			},
			tags: ['workspace'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.commandBus.execute(
				createWorkspaceAction(request.body, { userId })
			);

			return sendSuccess(reply, result, 201);
		},
	});
};

export default createWorkspaceRoute;
