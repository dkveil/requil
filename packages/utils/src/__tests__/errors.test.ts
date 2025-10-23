import { describe, expect, it } from 'vitest';
import {
	GuardrailError,
	isRequilError,
	sanitizeError,
	TransportError,
	ValidationError,
} from '../errors.js';

describe('errors', () => {
	describe('ValidationError', () => {
		it('should create validation error with correct properties', () => {
			const error = new ValidationError('Invalid input', { field: 'email' });

			expect(error.code).toBe('VALIDATION_ERROR');
			expect(error.statusCode).toBe(400);
			expect(error.message).toBe('Invalid input');
			expect(error.context.field).toBe('email');
			expect(error.isOperational).toBe(true);
		});
	});

	describe('TransportError', () => {
		it('should create transient transport error', () => {
			const error = new TransportError('Connection timeout', true);

			expect(error.code).toBe('TRANSPORT_ERROR_TRANSIENT');
			expect(error.statusCode).toBe(503);
			expect(error.isTransient).toBe(true);
		});

		it('should create permanent transport error', () => {
			const error = new TransportError('Invalid API key', false);

			expect(error.code).toBe('TRANSPORT_ERROR_PERMANENT');
			expect(error.statusCode).toBe(422);
			expect(error.isTransient).toBe(false);
		});
	});

	describe('GuardrailError', () => {
		it('should store violations', () => {
			const violations = [
				{
					rule: 'contrast',
					message: 'Low contrast',
					severity: 'error' as const,
				},
			];
			const error = new GuardrailError('Guardrail violations', violations);

			expect(error.violations).toEqual(violations);
			expect(error.context.violations).toEqual(violations);
		});
	});

	describe('isRequilError', () => {
		it('should identify RequilError instances', () => {
			const error = new ValidationError('Test');
			expect(isRequilError(error)).toBe(true);
		});

		it('should reject non-RequilError instances', () => {
			const error = new Error('Test');
			expect(isRequilError(error)).toBe(false);
		});
	});

	describe('sanitizeError', () => {
		it('should sanitize operational errors', () => {
			const error = new ValidationError('Invalid', { field: 'email' });
			const sanitized = sanitizeError(error, 'trace-123');

			expect(sanitized.statusCode).toBe(400);
			expect(sanitized.error.code).toBe('VALIDATION_ERROR');
			expect(sanitized.error.traceId).toBe('trace-123');
		});

		it('should hide details of non-operational errors', () => {
			const error = new Error('Database crash');
			const sanitized = sanitizeError(error, 'trace-456');

			expect(sanitized.statusCode).toBe(500);
			expect(sanitized.error.code).toBe('INTERNAL_ERROR');
			expect(sanitized.error.message).toBe('Internal server error');
		});
	});
});
