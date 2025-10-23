import { describe, expect, it } from 'vitest';
import {
	calculateBackoff,
	chunk,
	isEmail,
	normalizeEmail,
	omit,
	pick,
	safeJsonParse,
	truncate,
} from '../helpers.js';

describe('helpers', () => {
	describe('isEmail', () => {
		it('should validate correct emails', () => {
			expect(isEmail('test@example.com')).toBe(true);
			expect(isEmail('user+tag@domain.co.uk')).toBe(true);
		});

		it('should reject invalid emails', () => {
			expect(isEmail('not-an-email')).toBe(false);
			expect(isEmail('@example.com')).toBe(false);
			expect(isEmail('user@')).toBe(false);
		});
	});

	describe('normalizeEmail', () => {
		it('should lowercase and trim email', () => {
			expect(normalizeEmail('  TEST@Example.COM  ')).toBe('test@example.com');
		});
	});

	describe('truncate', () => {
		it('should truncate long strings', () => {
			expect(truncate('Hello World', 8)).toBe('Hello...');
		});

		it('should not truncate short strings', () => {
			expect(truncate('Hi', 10)).toBe('Hi');
		});
	});

	describe('chunk', () => {
		it('should split array into chunks', () => {
			const result = chunk([1, 2, 3, 4, 5], 2);
			expect(result).toEqual([[1, 2], [3, 4], [5]]);
		});
	});

	describe('calculateBackoff', () => {
		it('should calculate exponential backoff', () => {
			expect(calculateBackoff(1, 1000, 10000, 2)).toBe(1000);
			expect(calculateBackoff(2, 1000, 10000, 2)).toBe(2000);
			expect(calculateBackoff(3, 1000, 10000, 2)).toBe(4000);
		});

		it('should respect max delay', () => {
			expect(calculateBackoff(10, 1000, 10000, 2)).toBe(10000);
		});
	});

	describe('omit', () => {
		it('should omit specified keys', () => {
			const obj = { a: 1, b: 2, c: 3 };
			expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
		});
	});

	describe('pick', () => {
		it('should pick specified keys', () => {
			const obj = { a: 1, b: 2, c: 3 };
			expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
		});
	});

	describe('safeJsonParse', () => {
		it('should parse valid JSON', () => {
			expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
		});

		it('should return fallback for invalid JSON', () => {
			expect(safeJsonParse('invalid', { default: true })).toEqual({
				default: true,
			});
		});
	});
});
