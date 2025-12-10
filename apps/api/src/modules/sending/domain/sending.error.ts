import { ERROR_CODES } from '@requil/types';
import type { ErrorContext } from '@requil/utils';
import {
	TransportError as BaseTransportError,
	ConflictError,
	NotFoundError,
	RateLimitError,
	RequilError,
	ValidationError,
} from '@requil/utils';

export class SendingError extends RequilError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, ERROR_CODES.SENDING_ERROR, 500, context);
	}
}

export class TemplateNotFoundError extends NotFoundError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.TEMPLATE_NOT_FOUND;
	}
}

export class NoPublishedSnapshotError extends ConflictError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.NO_PUBLISHED_SNAPSHOT;
	}
}

export class IdempotencyConflictError extends ConflictError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.IDEMPOTENCY_CONFLICT;
	}
}

export class RateLimitExceededError extends RateLimitError {
	constructor(message: string, retryAfter: number, context: ErrorContext = {}) {
		super(message, retryAfter, context);
	}
}

export class TransportError extends BaseTransportError {
	constructor(
		message: string,
		isTransient: boolean,
		context: ErrorContext = {}
	) {
		super(message, isTransient, context);
	}
}

export class VariableValidationError extends ValidationError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.VARIABLE_VALIDATION_ERROR;
	}
}
