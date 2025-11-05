import { ERROR_CODES } from '@requil/types';
import type { ErrorContext } from '@requil/utils';
import { ValidationError } from '@requil/utils';

export class WorkspaceValidationError extends ValidationError {
	constructor(message: string, context: ErrorContext = {}) {
		super(message, context);
		this.name = ERROR_CODES.WORKSPACE_VALIDATION_ERROR;
	}
}
