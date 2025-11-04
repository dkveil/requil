import { ERROR_CODES, ERROR_MESSAGES } from '@requil/types';
import type { TraceId } from './logger';

export interface ErrorContext {
	traceId?: TraceId;
	statusCode?: number;
	[key: string]: unknown;
}

export class RequilError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly context: ErrorContext;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		code: string,
		statusCode: number,
		context: ErrorContext = {},
		isOperational = true
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.context = context;
		this.isOperational = isOperational;
		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			context: this.context,
			traceId: this.context.traceId,
		};
	}
}

export class ValidationError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.VALIDATION_ERROR, 400, context);
	}
}

export class AuthenticationError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.AUTHENTICATION_ERROR, 401, context);
	}
}

export class AuthorizationError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.AUTHORIZATION_ERROR, 403, context);
	}
}

export class NotFoundError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.NOT_FOUND, 404, context);
	}
}

export class ConflictError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.CONFLICT, 409, context);
	}
}

export class RateLimitError extends RequilError {
	constructor(message: string, retryAfter: number, context: ErrorContext = {}) {
		super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED, 429, {
			...context,
			retryAfter,
		});
	}
}

export class TransportError extends RequilError {
	public readonly isTransient: boolean;

	constructor(
		message: string,
		isTransient: boolean,
		context: ErrorContext = {}
	) {
		const statusCode = isTransient ? 503 : 422;
		super(
			message,
			isTransient
				? ERROR_CODES.TRANSPORT_ERROR_TRANSIENT
				: ERROR_CODES.TRANSPORT_ERROR_PERMANENT,
			statusCode,
			context
		);
		this.isTransient = isTransient;
	}
}

export class TemplateError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.TEMPLATE_ERROR, 400, context);
	}
}

export class GuardrailError extends RequilError {
	public readonly violations: Array<{
		rule: string;
		message: string;
		severity: 'error' | 'warning';
		path?: string;
	}>;

	constructor(
		message: string,
		violations: Array<{
			rule: string;
			message: string;
			severity: 'error' | 'warning';
			path?: string;
		}>,
		context: ErrorContext = {}
	) {
		super(message, ERROR_CODES.GUARDRAIL_VIOLATION, 400, {
			...context,
			violations,
		});
		this.violations = violations;
	}
}

export class IdempotencyError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.CONFLICT, 409, context);
	}
}

export class UsageLimitError extends RequilError {
	constructor(
		message: string,
		limitType: 'renders' | 'sends' | 'ai',
		context: ErrorContext = {}
	) {
		super(message, ERROR_CODES.USAGE_LIMIT_EXCEEDED, 402, {
			...context,
			limitType,
		});
	}
}

export const isRequilError = (error: unknown): error is RequilError => {
	return error instanceof RequilError;
};

export const sanitizeError = (error: unknown, traceId?: TraceId) => {
	if (isRequilError(error)) {
		return {
			error: {
				message: error.message,
				code: error.code,
				traceId: error.context.traceId || traceId,
				context: error.isOperational ? error.context : undefined,
			},
			statusCode: error.statusCode,
		};
	}

	return {
		error: {
			message: ERROR_MESSAGES.INTERNAL_ERROR,
			code: ERROR_CODES.INTERNAL_ERROR,
			traceId,
		},
		statusCode: 500,
	};
};
