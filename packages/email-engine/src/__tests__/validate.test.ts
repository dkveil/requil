import { describe, expect, it } from 'vitest';
import { validateVariables } from '../../src/validate';

const schema = {
	type: 'object',
	properties: {
		firstName: { type: 'string', default: 'Friend' },
		email: { type: 'string', format: 'email' },
	},
	required: ['email'],
	additionalProperties: false,
};

describe('validateVariables', () => {
	it('strict: rejects unknown fields and respects schema defaults only', () => {
		const res = validateVariables(
			schema,
			{ email: 'a@b.com', extra: 1 },
			'strict'
		);
		expect(res.ok).toBe(false);
		expect(res.errors.length).toBeGreaterThan(0);
	});

	it('permissive: accepts extra fields and applies defaults', () => {
		const res = validateVariables(schema, { email: 'a@b.com' }, 'permissive');
		expect(res.ok).toBe(true);
		expect(res.data.firstName).toBe('Friend');
	});
});
