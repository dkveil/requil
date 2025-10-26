import { validateVariables as validateVars } from '@requil/validation';
import type { VariablesValidationMode } from './types.js';

export function validateVariables(
	schema: unknown,
	variables: unknown,
	mode: VariablesValidationMode = 'strict'
): {
	ok: boolean;
	errors: string[];
	warnings: string[];
	data: Record<string, unknown>;
} {
	const result = validateVars(
		(variables as Record<string, unknown>) || {},
		// biome-ignore lint/suspicious/noExplicitAny: schema passthrough
		schema as any,
		mode
	);

	if (!result.valid) {
		return {
			ok: false,
			errors: (result.errors || []).map(
				(e: { field?: string; message?: string }) =>
					`${e.field ?? 'field'}: ${e.message ?? 'Validation error'}`
			),
			warnings: [],
			data: {},
		};
	}

	return {
		ok: true,
		errors: [],
		warnings: [],
		data: result.populated || {},
	};
}
