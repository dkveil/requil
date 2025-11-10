import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import {
	createTemplateResponseSchema,
	createTemplateSchema,
} from '@requil/types/templates';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { createTemplateAction } from './create-template.handler';

const createTemplateRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.TEMPLATE.CREATE,
		schema: {
			body: createTemplateSchema,
			response: {
				201: successResponseSchema(createTemplateResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				404: errorResponseSchema,
				409: errorResponseSchema,
			},
			tags: ['template'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.commandBus.execute(
				createTemplateAction(request.body, { userId })
			);

			return sendSuccess(reply, result, 201);
		},
	});
};

export default createTemplateRoute;
