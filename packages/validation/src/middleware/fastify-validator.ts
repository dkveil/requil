import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError, type ZodSchema } from 'zod';
import { zodErrorToValidationError } from './error-formatter';

export interface ValidatorSchema {
	body?: ZodSchema;
	querystring?: ZodSchema;
	params?: ZodSchema;
	headers?: ZodSchema;
}

declare module 'fastify' {
	interface FastifyContextConfig {
		validator?: ValidatorSchema;
	}
}

function validateRequest(
	request: FastifyRequest,
	validator: ValidatorSchema
): void {
	if (validator.body && request.body) {
		request.body = validator.body.parse(request.body);
	}

	if (validator.querystring && request.query) {
		request.query = validator.querystring.parse(request.query);
	}

	if (validator.params && request.params) {
		request.params = validator.params.parse(request.params);
	}

	if (validator.headers && request.headers) {
		request.headers = validator.headers.parse(
			request.headers
		) as typeof request.headers;
	}
}

/**
 * @example
 * import { validatorPlugin } from '@requil/validation/middleware';
 * import { sendRequestSchema } from '@requil/validation/schemas';
 *
 * await app.register(validatorPlugin);
 *
 * app.post('/v1/send', {
 *   config: {
 *     validator: {
 *       body: sendRequestSchema
 *     }
 *   }
 * }, async (request, reply) => {
 *   const { from, to, template } = request.body;
 * });
 */
const validatorPluginImpl: FastifyPluginAsync = async (fastify) => {
	fastify.addHook('preHandler', async (request: FastifyRequest) => {
		const validator = request.routeOptions.config?.validator;

		if (!validator) {
			return;
		}

		try {
			validateRequest(request, validator);
		} catch (error) {
			if (error instanceof ZodError) {
				throw zodErrorToValidationError(error, {
					path: request.url,
					method: request.method,
				});
			}
			throw error;
		}
	});
};

export const validatorPlugin = fp(validatorPluginImpl, {
	fastify: '5.x',
	name: '@requil/validation-plugin',
});
