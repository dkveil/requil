import { ValidationError } from '@requil/utils/errors';
import { type ZodError, type ZodIssue } from 'zod';

export interface FormattedValidationError {
	field: string;
	message: string;
	code?: string;
}

/**
 * @example
 * const zodError = schema.parse(invalidData); // throws ZodError
 * const formatted = formatZodError(zodError);
 * // [
 * //   { field: 'email', message: 'Invalid email address', code: 'invalid_string' },
 * //   { field: 'name', message: 'Required', code: 'invalid_type' }
 * // ]
 */
export function formatZodError(error: ZodError): FormattedValidationError[] {
	return error.issues.map((issue: ZodIssue) => ({
		field: formatPath(issue.path),
		message: issue.message,
		code: issue.code,
	}));
}

function formatPath(path: Array<string | number>): string {
	if (path.length === 0) return 'root';

	return path
		.map((segment, index) => {
			if (typeof segment === 'number') {
				return `[${segment}]`;
			}
			return index === 0 ? segment : `.${segment}`;
		})
		.join('');
}

/**
 * @example
 * try {
 *   const data = schema.parse(req.body);
 * } catch (error) {
 *   throw zodErrorToValidationError(error);
 * }
 */
export function zodErrorToValidationError(
	error: ZodError,
	context?: Record<string, unknown>
): ValidationError {
	const formatted = formatZodError(error);
	const message = `Validation failed: ${formatted.map((e) => `${e.field}: ${e.message}`).join(', ')}`;

	return new ValidationError(message, {
		...context,
		errors: formatted,
	});
}
