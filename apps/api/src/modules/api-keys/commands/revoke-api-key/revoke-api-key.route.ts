import { errorResponseSchema } from '@requil/types/api';
import { revokeApiKeyParamsSchema } from '@requil/types/api-keys';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { revokeApiKeyAction } from './revoke-api-key.handler';

const revokeApiKeyRoute: FastifyPluginAsync = async (fastify) => {
	fastify.setValidatorCompiler(validatorCompiler);
	fastify.setSerializerCompiler(serializerCompiler);

	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'DELETE',
		url: API_ROUTES.API_KEY.REVOKE,
		schema: {
			params: revokeApiKeyParamsSchema,
			response: {
				204: { type: 'null', description: 'No content' },
				401: errorResponseSchema,
				403: errorResponseSchema,
				404: errorResponseSchema,
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

			await fastify.commandBus.execute(
				revokeApiKeyAction(request.params, { workspaceId })
			);

			reply.code(204).send();
		},
	});
};

export default revokeApiKeyRoute;
