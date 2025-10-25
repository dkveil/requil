import { describe, expect, it, vi } from 'vitest';
import { ZodError, z } from 'zod';
import { formatZodError, zodErrorToValidationError } from '../error-formatter';

// Mock ValidationError since it's from @requil/utils/errors
vi.mock('@requil/utils/errors', () => ({
	ValidationError: class ValidationError extends Error {
		context: Record<string, unknown>;
		constructor(message: string, context?: Record<string, unknown>) {
			super(message);
			this.name = 'ValidationError';
			this.context = context || {};
		}
	},
}));

const { ValidationError } = await import('@requil/utils/errors');

describe('error formatter', () => {
	describe('formatZodError', () => {
		it('should format single field error', () => {
			const schema = z.object({
				email: z.string().email(),
			});

			try {
				schema.parse({ email: 'invalid' });
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted).toHaveLength(1);
				expect(formatted[0]).toMatchObject({
					field: 'email',
					message: 'Invalid email',
					code: 'invalid_string',
				});
			}
		});

		it('should format multiple field errors', () => {
			const schema = z.object({
				email: z.string().email(),
				age: z.number().min(18),
			});

			try {
				schema.parse({ email: 'invalid', age: 10 });
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted.length).toBeGreaterThanOrEqual(1);
				expect(formatted.some((e) => e.field === 'email')).toBe(true);
			}
		});

		it('should format required field error', () => {
			const schema = z.object({
				name: z.string(),
			});

			try {
				schema.parse({});
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted).toHaveLength(1);
				expect(formatted[0]).toMatchObject({
					field: 'name',
					code: 'invalid_type',
				});
			}
		});

		it('should format nested field errors', () => {
			const schema = z.object({
				user: z.object({
					email: z.string().email(),
				}),
			});

			try {
				schema.parse({ user: { email: 'invalid' } });
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted[0]?.field).toBe('user.email');
			}
		});

		it('should format array field errors', () => {
			const schema = z.object({
				emails: z.array(z.string().email()),
			});

			try {
				schema.parse({ emails: ['valid@example.com', 'invalid'] });
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted[0]?.field).toContain('[1]');
			}
		});

		it('should handle root level errors', () => {
			const schema = z.string();

			try {
				schema.parse(123);
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted[0]?.field).toBe('root');
			}
		});

		it('should include error codes', () => {
			const schema = z.object({
				age: z.number(),
			});

			try {
				schema.parse({ age: 'not a number' });
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted[0]?.code).toBeDefined();
			}
		});

		it('should handle complex nested structures', () => {
			const schema = z.object({
				users: z.array(
					z.object({
						name: z.string(),
						contacts: z.object({
							email: z.string().email(),
						}),
					})
				),
			});

			try {
				schema.parse({
					users: [{ name: 'John', contacts: { email: 'invalid' } }],
				});
			} catch (error) {
				const formatted = formatZodError(error as ZodError);

				expect(formatted[0]?.field).toBe('users[0].contacts.email');
			}
		});
	});

	describe('zodErrorToValidationError', () => {
		it('should convert ZodError to ValidationError', () => {
			const schema = z.object({
				email: z.string().email(),
			});

			try {
				schema.parse({ email: 'invalid' });
			} catch (error) {
				const validationError = zodErrorToValidationError(error as ZodError);

				expect(validationError).toBeInstanceOf(ValidationError);
				expect(validationError.message).toContain('Validation failed');
				expect(validationError.message).toContain('email');
			}
		});

		it('should include formatted errors in context', () => {
			const schema = z.object({
				email: z.string().email(),
				age: z.number().min(18),
			});

			try {
				schema.parse({ email: 'invalid', age: 10 });
			} catch (error) {
				const validationError = zodErrorToValidationError(error as ZodError);

				expect(validationError.context).toHaveProperty('errors');
				expect(Array.isArray(validationError.context.errors)).toBe(true);
			}
		});

		it('should merge additional context', () => {
			const schema = z.object({
				email: z.string().email(),
			});

			try {
				schema.parse({ email: 'invalid' });
			} catch (error) {
				const validationError = zodErrorToValidationError(error as ZodError, {
					path: '/api/users',
					method: 'POST',
				});

				expect(validationError.context).toMatchObject({
					path: '/api/users',
					method: 'POST',
				});
				expect(validationError.context).toHaveProperty('errors');
			}
		});

		it('should create descriptive error message', () => {
			const schema = z.object({
				email: z.string().email(),
				name: z.string().min(1),
			});

			try {
				schema.parse({ email: 'invalid', name: '' });
			} catch (error) {
				const validationError = zodErrorToValidationError(error as ZodError);

				expect(validationError.message).toContain('email');
				expect(validationError.message).toContain('Invalid email');
			}
		});

		it('should handle multiple errors in message', () => {
			const schema = z.object({
				email: z.string().email(),
				age: z.number(),
				name: z.string(),
			});

			try {
				schema.parse({ email: 'invalid' });
			} catch (error) {
				const validationError = zodErrorToValidationError(error as ZodError);

				expect(validationError.message).toContain(',');
			}
		});

		it('should preserve original error information', () => {
			const schema = z.object({
				email: z.string().email(),
			});

			try {
				schema.parse({ email: 'invalid' });
			} catch (error) {
				const validationError = zodErrorToValidationError(error as ZodError);

				expect(validationError.context.errors).toHaveLength(1);
				expect(validationError.context.errors[0]).toMatchObject({
					field: 'email',
					message: 'Invalid email',
				});
			}
		});
	});
});
