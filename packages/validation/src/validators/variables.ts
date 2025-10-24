import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

const INSTANCE_PATH_REGEX = /^\//;

const ajv = new Ajv({ useDefaults: true, coerceTypes: false, strict: false });
addFormats(ajv);

export interface VariableValidationResult {
	valid: boolean;
	errors?: Array<{
		field: string;
		message: string;
	}>;
	populated?: Record<string, unknown>;
}

export type ValidationMode = 'strict' | 'permissive';

/**
 * @example Strict mode (reject extra variables)
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     firstName: { type: 'string', default: 'Friend' }
 *   },
 *   required: ['firstName'],
 *   additionalProperties: false
 * };
 * const result = validateVariables(
 *   { firstName: 'John', lastName: 'Doe' },
 *   schema,
 *   'strict'
 * );
 * // { valid: false, errors: [{ field: 'lastName', message: '...' }] }
 *
 * @example Permissive mode (allow extra, populate defaults)
 * const result = validateVariables(
 *   { lastName: 'Doe' },
 *   schema,
 *   'permissive'
 * );
 * // { valid: true, populated: { firstName: 'Friend', lastName: 'Doe' } }
 */
export function validateVariables(
	variables: Record<string, unknown>,
	schema: JSONSchemaType<any> | Record<string, unknown>,
	mode: ValidationMode = 'strict'
): VariableValidationResult {
	const schemaWithMode = {
		...schema,
		additionalProperties: mode === 'permissive',
	};

	const validate = ajv.compile(schemaWithMode);
	const dataCopy = JSON.parse(JSON.stringify(variables));

	const valid = validate(dataCopy);

	if (!valid && validate.errors) {
		return {
			valid: false,
			errors: validate.errors.map((error) => ({
				field:
					error.instancePath.replace(INSTANCE_PATH_REGEX, '') ||
					error.params.missingProperty ||
					'root',
				message: error.message || 'Validation error',
			})),
		};
	}

	return {
		valid: true,
		populated: dataCopy,
	};
}

/**
 * @example
 * const defaults = extractDefaults({
 *   type: 'object',
 *   properties: {
 *     firstName: { type: 'string', default: 'Friend' },
 *     age: { type: 'number', default: 0 }
 *   }
 * });
 * // { firstName: 'Friend', age: 0 }
 */
export function extractDefaults(
	schema: Record<string, unknown>
): Record<string, unknown> {
	const defaults: Record<string, unknown> = {};

	if (
		schema.type === 'object' &&
		schema.properties &&
		typeof schema.properties === 'object'
	) {
		for (const [key, prop] of Object.entries(schema.properties)) {
			if (typeof prop === 'object' && prop !== null && 'default' in prop) {
				defaults[key] = prop.default;
			}
		}
	}

	return defaults;
}

/**
 * @example
 * const merged = mergeWithDefaults(
 *   { firstName: 'John' },
 *   { firstName: 'Friend', lastName: 'Doe' }
 * );
 * // { firstName: 'John', lastName: 'Doe' }
 */
export function mergeWithDefaults(
	variables: Record<string, unknown>,
	defaults: Record<string, unknown>
): Record<string, unknown> {
	return {
		...defaults,
		...variables,
	};
}
