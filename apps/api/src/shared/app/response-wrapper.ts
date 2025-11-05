import type { ErrorResponse, SuccessResponse } from '@requil/types';
import type { FastifyReply } from 'fastify';

export function sendSuccess<T>(
	reply: FastifyReply,
	data: T,
	statusCode = 200
): FastifyReply {
	return reply.status(statusCode).send({
		success: true,
		status: statusCode,
		data,
	} as SuccessResponse<T>);
}

export function sendError<T>(
	reply: FastifyReply,
	error: ErrorResponse['error'],
	statusCode = 500
): FastifyReply {
	return reply.status(statusCode).send({
		success: false,
		status: statusCode,
		error,
	} as ErrorResponse);
}
