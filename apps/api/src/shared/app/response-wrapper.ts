import type { SuccessResponse } from '@requil/types';
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
