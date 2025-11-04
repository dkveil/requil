import type { ErrorCode, ErrorResponse } from '@requil/types';
import { ERROR_MESSAGES_PL } from '@requil/types';

export class ApiClientError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly traceId?: string;
	public readonly context?: Record<string, unknown>;

	constructor(
		message: string,
		code: string,
		statusCode: number,
		traceId?: string,
		context?: Record<string, unknown>
	) {
		super(message);
		this.name = 'ApiClientError';
		this.code = code;
		this.statusCode = statusCode;
		this.traceId = traceId;
		this.context = context;
	}
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof ApiClientError) {
		return ERROR_MESSAGES_PL[error.code as ErrorCode] || error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'Wystąpił nieoczekiwany błąd';
}

export function parseApiError(
	errorData: ErrorResponse,
	statusCode: number
): ApiClientError {
	return new ApiClientError(
		errorData.error.message,
		errorData.error.code,
		statusCode,
		errorData.error.traceId,
		errorData.error.context
	);
}
