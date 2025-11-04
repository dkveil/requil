import type { ErrorResponse } from '@requil/types/api';
import {
	isRequilError,
	type RequilError,
	sanitizeError,
	ValidationError,
} from '@requil/utils';
import type {
	FastifyError,
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';

function formatZodError(zodError: ZodError): ValidationError {
	const errors = zodError.issues.map((issue) => ({
		field: issue.path.join('.') || 'root',
		message: issue.message,
		code: issue.code,
	}));

	const message = `Validation failed: ${errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(', ')}`;

	return new ValidationError(message, { errors });
}

async function errorHandlerPlugin(fastify: FastifyInstance) {
	fastify.setErrorHandler(
		(
			error: Error | FastifyError | ZodError,
			request: FastifyRequest,
			reply: FastifyReply
		) => {
			const traceId = request.id;

			let processedError: Error;

			if (error instanceof ZodError) {
				processedError = formatZodError(error);
			} else {
				processedError = error;
			}

			const { error: sanitized, statusCode } = sanitizeError(
				processedError,
				traceId
			);

			const isFastifyError = 'statusCode' in error;
			const finalStatusCode = isFastifyError
				? error.statusCode || statusCode
				: statusCode;

			const response: ErrorResponse = {
				success: false,
				status: finalStatusCode,
				error: {
					message: sanitized.message,
					code: sanitized.code,
					traceId: sanitized.traceId,
					context: sanitized.context,
				},
			};

			if (finalStatusCode >= 500) {
				request.log.error(
					{
						err: processedError,
						traceId,
						url: request.url,
						method: request.method,
						statusCode: finalStatusCode,
					},
					`Internal server error: ${processedError.message}`
				);
			} else if (finalStatusCode >= 400) {
				request.log.warn(
					{
						err: isRequilError(processedError)
							? (processedError as RequilError).toJSON()
							: { message: processedError.message, name: processedError.name },
						traceId,
						url: request.url,
						method: request.method,
						statusCode: finalStatusCode,
					},
					`Client error: ${processedError.message}`
				);
			}

			reply.status(finalStatusCode).send(response);
		}
	);

	fastify.setNotFoundHandler((request, reply) => {
		const traceId = request.id;

		request.log.warn(
			{
				traceId,
				url: request.url,
				method: request.method,
			},
			`Route not found: ${request.method} ${request.url}`
		);

		reply.status(404).send({
			success: false,
			status: 404,
			error: {
				message: `Route ${request.method} ${request.url} not found`,
				code: 'NOT_FOUND',
				traceId,
			},
		});
	});
}

export default fp(errorHandlerPlugin, {
	name: 'error-handler',
});
