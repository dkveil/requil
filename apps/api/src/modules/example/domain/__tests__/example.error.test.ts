import { describe, expect, it } from 'vitest';
import {
	ExampleAlreadyExistsError,
	ExampleNotFoundError,
	ExampleValidationError,
} from '../example.error';

describe('Example Errors', () => {
	describe('ExampleNotFoundError', () => {
		it('should create error with correct message', () => {
			const id = 'test-id';
			const error = new ExampleNotFoundError(id);

			expect(error.message).toBe(`Example with id ${id} not found`);
			expect(error.name).toBe('ExampleNotFoundError');
			expect(error).toBeInstanceOf(Error);
		});

		it('should be throwable', () => {
			expect(() => {
				throw new ExampleNotFoundError('test-id');
			}).toThrow(ExampleNotFoundError);
		});
	});

	describe('ExampleValidationError', () => {
		it('should create error with custom message', () => {
			const message = 'Invalid input';
			const error = new ExampleValidationError(message);

			expect(error.message).toBe(message);
			expect(error.name).toBe('ExampleValidationError');
			expect(error).toBeInstanceOf(Error);
		});

		it('should be throwable', () => {
			expect(() => {
				throw new ExampleValidationError('Validation failed');
			}).toThrow(ExampleValidationError);
		});
	});

	describe('ExampleAlreadyExistsError', () => {
		it('should create error with correct message', () => {
			const name = 'Test Example';
			const error = new ExampleAlreadyExistsError(name);

			expect(error.message).toBe(`Example with name "${name}" already exists`);
			expect(error.name).toBe('ExampleAlreadyExistsError');
			expect(error).toBeInstanceOf(Error);
		});

		it('should be throwable', () => {
			expect(() => {
				throw new ExampleAlreadyExistsError('Test Example');
			}).toThrow(ExampleAlreadyExistsError);
		});
	});
});
