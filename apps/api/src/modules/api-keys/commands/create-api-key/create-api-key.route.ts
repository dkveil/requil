import { errorResponseSchema, successResponseSchema } from '@requil/types/api';
import {
	createApiKeyResponseSchema,
	createApiKeySchema,
} from '@requil/types/api-keys';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { createApiKeyAction } from './create-api-key.handler';

const createApiKeyRoute: FastifyPluginAsync = async (fastify) => {
	fastify.setValidatorCompiler(validatorCompiler);
	fastify.setSerializerCompiler(serializerCompiler);

	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.API_KEY.CREATE,
		schema: {
			body: createApiKeySchema,
			response: {
				201: successResponseSchema(createApiKeyResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				403: errorResponseSchema,
			},
			tags: ['api-keys'],
		},
		onRequest: [
			fastify.authenticate,
			fastify.requireWorkspace,
			fastify.requireOwner,
		],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;
			const workspaceId = request.workspaceId;

			const result = await fastify.commandBus.execute(
				createApiKeyAction(request.body, { userId, workspaceId })
			);

			return sendSuccess(reply, result, 201);
		},
	});
};

export default createApiKeyRoute;
