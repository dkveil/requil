import { errorResponseSchema, successResponseSchema } from '@requil/types/api';
import {
	listApiKeysQuerySchema,
	listApiKeysResponseSchema,
} from '@requil/types/api-keys';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { listApiKeysAction } from './list-api-keys.handler';

const listApiKeysRoute: FastifyPluginAsync = async (fastify) => {
	fastify.setValidatorCompiler(validatorCompiler);
	fastify.setSerializerCompiler(serializerCompiler);

	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.API_KEY.LIST,
		schema: {
			querystring: listApiKeysQuerySchema,
			response: {
				200: successResponseSchema(listApiKeysResponseSchema),
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
			const workspaceId = request.workspaceId;

			const result = await fastify.queryBus.execute(
				listApiKeysAction(request.query, { workspaceId })
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default listApiKeysRoute;
