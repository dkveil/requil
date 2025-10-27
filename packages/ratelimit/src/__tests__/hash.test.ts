import { describe, expect, it } from 'vitest';
import { hashObject, hashString } from '../utils/hash';

const HEX_HASH_REGEX = /^[a-f0-9]{64}$/;

describe('hash utilities', () => {
	describe('hashString', () => {
		it('should generate consistent hash for same string', () => {
			const str = 'test-string';

			const hash1 = hashString(str);
			const hash2 = hashString(str);

			expect(hash1).toBe(hash2);
		});

		it('should generate different hashes for different strings', () => {
			const str1 = 'test-string-1';
			const str2 = 'test-string-2';

			const hash1 = hashString(str1);
			const hash2 = hashString(str2);

			expect(hash1).not.toBe(hash2);
		});

		it('should generate 64-character hex string', () => {
			const str = 'test';
			const hash = hashString(str);

			expect(hash).toHaveLength(64);
			expect(hash).toMatch(HEX_HASH_REGEX);
		});

		it('should handle empty string', () => {
			const hash = hashString('');

			expect(hash).toHaveLength(64);
			expect(hash).toBeTruthy();
		});

		it('should handle unicode characters', () => {
			const str = 'Hello 世界 🌍';

			const hash1 = hashString(str);
			const hash2 = hashString(str);

			expect(hash1).toBe(hash2);
		});

		it('should be case sensitive', () => {
			const hash1 = hashString('test');
			const hash2 = hashString('TEST');

			expect(hash1).not.toBe(hash2);
		});
	});

	describe('hashObject', () => {
		it('should generate consistent hash for same object', () => {
			const obj = { name: 'test', value: 42 };

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should generate same hash regardless of property order', () => {
			const obj1 = { a: 1, b: 2, c: 3 };
			const obj2 = { c: 3, b: 2, a: 1 };

			const hash1 = hashObject(obj1);
			const hash2 = hashObject(obj2);

			expect(hash1).toBe(hash2);
		});

		it('should generate different hashes for different objects', () => {
			const obj1 = { name: 'test1', value: 1 };
			const obj2 = { name: 'test2', value: 2 };

			const hash1 = hashObject(obj1);
			const hash2 = hashObject(obj2);

			expect(hash1).not.toBe(hash2);
		});

		it('should handle nested objects', () => {
			const obj = {
				user: {
					id: 123,
					profile: {
						name: 'Test User',
						email: 'test@example.com',
					},
				},
			};

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should handle arrays', () => {
			const obj = {
				items: [1, 2, 3],
				users: ['alice', 'bob'],
			};

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should differentiate array order', () => {
			const obj1 = { items: [1, 2, 3] };
			const obj2 = { items: [3, 2, 1] };

			const hash1 = hashObject(obj1);
			const hash2 = hashObject(obj2);

			expect(hash1).not.toBe(hash2);
		});

		it('should handle empty object', () => {
			const hash = hashObject({});

			expect(hash).toHaveLength(64);
			expect(hash).toBeTruthy();
		});

		it('should handle null values', () => {
			const obj = { value: null, data: 'test' };

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should handle boolean values', () => {
			const obj = { active: true, deleted: false };

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should handle number types', () => {
			const obj = {
				integer: 42,
				float: 3.14,
				negative: -10,
				zero: 0,
			};

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should differentiate between similar structures', () => {
			const obj1 = { a: { b: 1 } };
			const obj2 = { a: { b: 2 } };

			const hash1 = hashObject(obj1);
			const hash2 = hashObject(obj2);

			expect(hash1).not.toBe(hash2);
		});

		it('should handle complex nested structures', () => {
			const obj = {
				level1: {
					level2: {
						level3: {
							level4: {
								value: 'deep',
								array: [1, 2, { nested: true }],
							},
						},
					},
				},
			};

			const hash1 = hashObject(obj);
			const hash2 = hashObject(obj);

			expect(hash1).toBe(hash2);
		});

		it('should generate 64-character hex string', () => {
			const obj = { test: 'value' };
			const hash = hashObject(obj);

			expect(hash).toHaveLength(64);
			expect(hash).toMatch(HEX_HASH_REGEX);
		});
	});

	describe('hash collision resistance', () => {
		it('should generate unique hashes for many different objects', () => {
			const hashes = new Set<string>();

			for (let i = 0; i < 1000; i++) {
				const obj = {
					id: i,
					email: `user${i}@example.com`,
					timestamp: Date.now() + i,
				};

				const hash = hashObject(obj);
				hashes.add(hash);
			}

			expect(hashes.size).toBe(1000);
		});

		it('should generate unique hashes for similar strings', () => {
			const strings = [
				'test',
				'test1',
				'test2',
				'test ',
				' test',
				'Test',
				'TEST',
			];

			const hashes = strings.map((s) => hashString(s));
			const uniqueHashes = new Set(hashes);

			expect(uniqueHashes.size).toBe(strings.length);
		});
	});
});
