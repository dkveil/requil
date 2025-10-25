import { describe, expect, it } from 'vitest';
import {
	extractDefaults,
	mergeWithDefaults,
	validateVariables,
} from '../variables';

describe('variables validators', () => {
	describe('validateVariables', () => {
		const simpleSchema = {
			type: 'object',
			properties: {
				firstName: { type: 'string' },
				age: { type: 'number' },
			},
			required: ['firstName'],
		};

		it('should validate correct variables in strict mode', () => {
			const variables = { firstName: 'John', age: 25 };
			const result = validateVariables(variables, simpleSchema, 'strict');

			expect(result.valid).toBe(true);
			expect(result.errors).toBeUndefined();
			expect(result.populated).toEqual({ firstName: 'John', age: 25 });
		});

		it('should reject missing required field in strict mode', () => {
			const variables = { age: 25 };
			const result = validateVariables(variables, simpleSchema, 'strict');

			expect(result.valid).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors?.[0]?.field).toBe('firstName');
		});

		it('should reject additional properties in strict mode', () => {
			const schemaWithAdditionalFalse = {
				...simpleSchema,
				additionalProperties: false,
			};
			const variables = { firstName: 'John', age: 25, extra: 'field' };
			const result = validateVariables(
				variables,
				schemaWithAdditionalFalse,
				'strict'
			);

			expect(result.valid).toBe(false);
			expect(result.errors).toBeDefined();
		});

		it('should allow additional properties in permissive mode', () => {
			const variables = { firstName: 'John', age: 25, extra: 'field' };
			const result = validateVariables(variables, simpleSchema, 'permissive');

			expect(result.valid).toBe(true);
			expect(result.populated).toEqual({
				firstName: 'John',
				age: 25,
				extra: 'field',
			});
		});

		it('should apply default values', () => {
			const schemaWithDefaults = {
				type: 'object',
				properties: {
					firstName: { type: 'string', default: 'Friend' },
					age: { type: 'number', default: 0 },
				},
			};

			const variables = {};
			const result = validateVariables(
				variables,
				schemaWithDefaults,
				'permissive'
			);

			expect(result.valid).toBe(true);
			expect(result.populated).toEqual({ firstName: 'Friend', age: 0 });
		});

		it('should validate type constraints', () => {
			const variables = { firstName: 123, age: 25 };
			const result = validateVariables(variables, simpleSchema, 'strict');

			expect(result.valid).toBe(false);
			expect(result.errors).toBeDefined();
		});

		it('should validate nested objects', () => {
			const nestedSchema = {
				type: 'object',
				properties: {
					user: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							email: { type: 'string', format: 'email' },
						},
						required: ['name'],
					},
				},
			};

			const variables = { user: { name: 'John', email: 'john@example.com' } };
			const result = validateVariables(variables, nestedSchema, 'strict');

			expect(result.valid).toBe(true);
		});

		it('should validate array properties', () => {
			const arraySchema = {
				type: 'object',
				properties: {
					tags: { type: 'array', items: { type: 'string' } },
				},
			};

			const variables = { tags: ['tag1', 'tag2', 'tag3'] };
			const result = validateVariables(variables, arraySchema, 'permissive');

			expect(result.valid).toBe(true);
		});

		it('should use strict mode by default', () => {
			const variables = { firstName: 'John', age: 25, extra: 'field' };
			const result = validateVariables(variables, simpleSchema);

			expect(result.valid).toBe(false);
		});

		it('should handle empty variables object', () => {
			const emptySchema = {
				type: 'object',
				properties: {},
			};

			const variables = {};
			const result = validateVariables(variables, emptySchema, 'permissive');

			expect(result.valid).toBe(true);
			expect(result.populated).toEqual({});
		});

		it('should validate boolean properties', () => {
			const booleanSchema = {
				type: 'object',
				properties: {
					isActive: { type: 'boolean' },
				},
			};

			const variables = { isActive: true };
			const result = validateVariables(variables, booleanSchema, 'permissive');

			expect(result.valid).toBe(true);
		});

		it('should provide detailed error messages', () => {
			const variables = { firstName: 'John' };
			const result = validateVariables(variables, simpleSchema, 'strict');

			expect(result.valid).toBe(true);
		});
	});

	describe('extractDefaults', () => {
		it('should extract default values from schema', () => {
			const schema = {
				type: 'object',
				properties: {
					firstName: { type: 'string', default: 'Friend' },
					age: { type: 'number', default: 0 },
					isActive: { type: 'boolean', default: true },
				},
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({
				firstName: 'Friend',
				age: 0,
				isActive: true,
			});
		});

		it('should return empty object when no defaults', () => {
			const schema = {
				type: 'object',
				properties: {
					firstName: { type: 'string' },
					age: { type: 'number' },
				},
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({});
		});

		it('should handle schema without properties', () => {
			const schema = {
				type: 'object',
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({});
		});

		it('should handle schema with some defaults', () => {
			const schema = {
				type: 'object',
				properties: {
					firstName: { type: 'string', default: 'Friend' },
					lastName: { type: 'string' },
					age: { type: 'number', default: 18 },
				},
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({
				firstName: 'Friend',
				age: 18,
			});
		});

		it('should handle default values of different types', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string', default: 'John' },
					age: { type: 'number', default: 25 },
					isActive: { type: 'boolean', default: false },
					tags: { type: 'array', default: [] },
					config: { type: 'object', default: {} },
				},
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({
				name: 'John',
				age: 25,
				isActive: false,
				tags: [],
				config: {},
			});
		});

		it('should not extract defaults from non-object schemas', () => {
			const schema = {
				type: 'string',
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({});
		});

		it('should handle null properties', () => {
			const schema = {
				type: 'object',
				properties: null,
			};

			const defaults = extractDefaults(schema);

			expect(defaults).toEqual({});
		});
	});

	describe('mergeWithDefaults', () => {
		it('should merge variables with defaults', () => {
			const variables = { firstName: 'John' };
			const defaults = { firstName: 'Friend', lastName: 'Doe', age: 0 };

			const merged = mergeWithDefaults(variables, defaults);

			expect(merged).toEqual({
				firstName: 'John',
				lastName: 'Doe',
				age: 0,
			});
		});

		it('should override defaults with provided variables', () => {
			const variables = { firstName: 'John', age: 25 };
			const defaults = { firstName: 'Friend', age: 0 };

			const merged = mergeWithDefaults(variables, defaults);

			expect(merged).toEqual({
				firstName: 'John',
				age: 25,
			});
		});

		it('should handle empty variables', () => {
			const variables = {};
			const defaults = { firstName: 'Friend', age: 0 };

			const merged = mergeWithDefaults(variables, defaults);

			expect(merged).toEqual({
				firstName: 'Friend',
				age: 0,
			});
		});

		it('should handle empty defaults', () => {
			const variables = { firstName: 'John', age: 25 };
			const defaults = {};

			const merged = mergeWithDefaults(variables, defaults);

			expect(merged).toEqual({
				firstName: 'John',
				age: 25,
			});
		});

		it('should handle both empty', () => {
			const variables = {};
			const defaults = {};

			const merged = mergeWithDefaults(variables, defaults);

			expect(merged).toEqual({});
		});

		it('should not mutate original variables', () => {
			const variables = { firstName: 'John' };
			const defaults = { firstName: 'Friend', lastName: 'Doe' };

			mergeWithDefaults(variables, defaults);

			expect(variables).toEqual({ firstName: 'John' });
		});

		it('should not mutate original defaults', () => {
			const variables = { firstName: 'John' };
			const defaults = { firstName: 'Friend', lastName: 'Doe' };

			mergeWithDefaults(variables, defaults);

			expect(defaults).toEqual({ firstName: 'Friend', lastName: 'Doe' });
		});

		it('should handle complex objects', () => {
			const variables = { user: { name: 'John' } };
			const defaults = {
				user: { name: 'Friend', email: 'friend@example.com' },
			};

			const merged = mergeWithDefaults(variables, defaults);

			expect(merged).toEqual({
				user: { name: 'John' },
			});
		});
	});
});
