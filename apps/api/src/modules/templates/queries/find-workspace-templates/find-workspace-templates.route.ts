import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	findWorkspaceTemplatesQuerySchema,
	findWorkspaceTemplatesResponseSchema,
} from '@requil/types/templates';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { findWorkspaceTemplatesAction } from './find-workspace-templates.handler';

const findWorkspaceTemplatesRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.TEMPLATE.LIST,
		schema: {
			querystring: findWorkspaceTemplatesQuerySchema,
			response: {
				200: successResponseSchema(findWorkspaceTemplatesResponseSchema),
				401: errorResponseSchema,
				404: errorResponseSchema,
			},
			tags: ['template'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.queryBus.execute(
				findWorkspaceTemplatesAction(request.query, { userId })
			);

			return sendSuccess(reply, result);
		},
	});
};

export default findWorkspaceTemplatesRoute;
