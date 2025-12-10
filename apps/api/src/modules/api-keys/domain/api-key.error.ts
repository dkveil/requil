import { ERROR_CODES } from '@requil/types';
import type { ErrorContext } from '@requil/utils';
import {
	AuthorizationError,
	ConflictError,
	NotFoundError,
	ValidationError,
} from '@requil/utils';

export class ApiKeyValidationError extends ValidationError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.VALIDATION_ERROR;
	}
}

export class ApiKeyNotFoundError extends NotFoundError {
	constructor(message = 'API key not found', context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.NOT_FOUND;
	}
}

export class ApiKeyConflictError extends ConflictError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.CONFLICT;
	}
}

export class ApiKeyAuthorizationError extends AuthorizationError {
	constructor(
		message = 'Access to API keys denied',
		context: ErrorContext = {}
	) {
		super(message, context);
		this.name = ERROR_CODES.AUTHORIZATION_ERROR;
	}
}
