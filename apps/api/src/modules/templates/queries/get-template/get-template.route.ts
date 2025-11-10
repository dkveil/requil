import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	getTemplateQuerySchema,
	templateResponseSchema,
} from '@requil/types/templates';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { getTemplateAction } from './get-template.handler';

const getTemplateRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.TEMPLATE.GET,
		schema: {
			querystring: getTemplateQuerySchema,
			response: {
				200: successResponseSchema(templateResponseSchema),
				401: errorResponseSchema,
				404: errorResponseSchema,
			},
			tags: ['template'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.queryBus.execute(
				getTemplateAction(request.query, { userId })
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default getTemplateRoute;
