import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { accountSchema } from '@requil/types/billing';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { getAccountAction } from './get-account.handler';

const getAccountRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'GET',
		url: API_ROUTES.ACCOUNT.GET,
		schema: {
			response: {
				200: successResponseSchema(accountSchema.nullable()),
				401: errorResponseSchema,
			},
			tags: ['account'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const result = await fastify.queryBus.execute(
				getAccountAction(undefined, { userId })
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default getAccountRoute;
