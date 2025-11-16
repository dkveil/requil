import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	updateTemplateParamsSchema,
	updateTemplateResponseSchema,
	updateTemplateSchema,
} from '@requil/types/templates';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { updateTemplateAction } from './update-template.handler';

const updateTemplateRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'PATCH',
		url: API_ROUTES.TEMPLATE.UPDATE,
		schema: {
			body: updateTemplateSchema,
			params: updateTemplateParamsSchema,
			response: {
				200: successResponseSchema(updateTemplateResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				404: errorResponseSchema,
			},
			tags: ['template'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.commandBus.execute(
				updateTemplateAction(
					{ ...request.body, id: request.params.id },
					{ userId }
				)
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default updateTemplateRoute;
