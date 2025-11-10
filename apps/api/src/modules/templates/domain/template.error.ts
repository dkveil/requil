import { ERROR_CODES } from '@requil/types';
import type { ErrorContext } from '@requil/utils';
import { ConflictError, NotFoundError, ValidationError } from '@requil/utils';

export class TemplateValidationError extends ValidationError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.TEMPLATE_VALIDATION_ERROR;
	}
}

export class TemplateConflictError extends ConflictError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.TEMPLATE_CONFLICT;
	}
}

export class TemplateNotFoundError extends NotFoundError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.TEMPLATE_NOT_FOUND;
	}
}
