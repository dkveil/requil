import {
	ERROR_CODES,
	errorResponseSchema,
	sendEmailResponseSchema,
	sendEmailSchema,
	successResponseSchema,
} from '@requil/types';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendError, sendSuccess } from '@/shared/app/response-wrapper';
import { sendEmailAction } from './send-email.handler';

const sendEmailRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.SEND.CREATE,
		schema: {
			body: sendEmailSchema,
			response: {
				200: successResponseSchema(sendEmailResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				409: errorResponseSchema,
				429: errorResponseSchema,
				502: errorResponseSchema,
			},
			tags: ['sending'],
		},
		preHandler: async (request, reply) => {
			await fastify.authenticateApiOrSession(request, reply, {
				requireScope: 'send',
			});
		},
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;
			const workspaceId = request.workspaceId;
			const authMethod = request.authMethod;

			if (!workspaceId) {
				return sendError(
					reply,
					{
						code: ERROR_CODES.VALIDATION_ERROR,
						message: 'Workspace ID is required',
					},
					400
				);
			}

			const idempotencyKey = request.headers['idempotency-key'] as
				| string
				| undefined;

			if (authMethod === 'api_key' && !idempotencyKey) {
				return sendError(
					reply,
					{
						code: ERROR_CODES.VALIDATION_ERROR,
						message: 'Idempotency-Key header is required for API key requests',
					},
					400
				);
			}

			const result = await fastify.commandBus.execute(
				sendEmailAction(request.body, {
					userId,
					workspaceId,
					idempotencyKey,
					authMethod,
				})
			);

			return sendSuccess(reply, result, 200);
		},
	});
};

export default sendEmailRoute;
