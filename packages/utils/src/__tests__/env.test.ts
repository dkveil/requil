import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
	nodeEnv,
	requiredPort,
	requiredString,
	requiredUrl,
	validateEnv,
} from '../env';

describe('env utils', () => {
	describe('validateEnv', () => {
		it('should validate correct environment variables', () => {
			const schema = z.object({
				TEST_VAR: z.string(),
				TEST_NUMBER: z.coerce.number(),
			});

			const result = validateEnv(schema, {
				TEST_VAR: 'hello',
				TEST_NUMBER: '42',
			});

			expect(result.TEST_VAR).toBe('hello');
			expect(result.TEST_NUMBER).toBe(42);
		});

		it('should throw error for invalid environment variables', () => {
			const schema = z.object({
				REQUIRED_VAR: z.string(),
			});

			expect(() => validateEnv(schema, {})).toThrow(
				'Invalid environment variables'
			);
		});
	});

	describe('requiredString', () => {
		it('should validate non-empty strings', () => {
			const schema = requiredString('TEST');
			expect(schema.parse('value')).toBe('value');
		});

		it('should reject empty strings', () => {
			const schema = requiredString('TEST');
			expect(() => schema.parse('')).toThrow();
		});
	});

	describe('requiredUrl', () => {
		it('should validate URLs', () => {
			const schema = requiredUrl('API_URL');
			expect(schema.parse('https://api.example.com')).toBe(
				'https://api.example.com'
			);
		});

		it('should reject invalid URLs', () => {
			const schema = requiredUrl('API_URL');
			expect(() => schema.parse('not-a-url')).toThrow();
		});
	});

	describe('requiredPort', () => {
		it('should validate port numbers', () => {
			const schema = requiredPort('PORT');
			expect(schema.parse('3000')).toBe(3000);
			expect(schema.parse('8080')).toBe(8080);
		});

		it('should reject invalid port numbers', () => {
			const schema = requiredPort('PORT');
			expect(() => schema.parse('99999')).toThrow();
			expect(() => schema.parse('0')).toThrow();
		});
	});

	describe('nodeEnv', () => {
		it('should validate node environment', () => {
			const schema = nodeEnv();
			expect(schema.parse('development')).toBe('development');
			expect(schema.parse('production')).toBe('production');
			expect(schema.parse('test')).toBe('test');
		});

		it('should use default value', () => {
			const schema = nodeEnv();
			expect(schema.parse(undefined)).toBe('development');
		});
	});
});
