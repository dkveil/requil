import { ERROR_CODES } from '@requil/types';
import type { ErrorContext } from '@requil/utils';
import {
	AuthorizationError,
	ConflictError,
	NotFoundError,
	ValidationError,
} from '@requil/utils';

export class WorkspaceValidationError extends ValidationError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.WORKSPACE_VALIDATION_ERROR;
	}
}

export class WorkspaceConflictError extends ConflictError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.CONFLICT;
	}
}

export class WorkspaceNotFoundError extends NotFoundError {
	constructor(message = 'Workspace not found', context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.NOT_FOUND;
	}
}

export class WorkspaceAuthorizationError extends AuthorizationError {
	constructor(
		message = 'Access to workspace denied',
		context: ErrorContext = {}
	) {
		super(message, context);
		this.name = ERROR_CODES.AUTHORIZATION_ERROR;
	}
}
