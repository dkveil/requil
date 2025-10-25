import { describe, expect, it } from 'vitest';
import {
	apiKeyQuerySchema,
	apiKeyScopeEnum,
	createApiKeySchema,
	updateApiKeySchema,
} from '../api-key';

describe('api-key schemas', () => {
	describe('createApiKeySchema', () => {
		it('should validate correct API key creation', () => {
			const data = {
				name: 'Production API Key',
				scopes: ['send', 'templates:read'],
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require name field', () => {
			const data = {
				scopes: ['send'],
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require at least one scope', () => {
			const data = {
				name: 'Test Key',
				scopes: [],
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject invalid scope', () => {
			const data = {
				name: 'Test Key',
				scopes: ['invalid_scope'],
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with optional fields', () => {
			const data = {
				name: 'Test Key',
				description: 'A test API key',
				scopes: ['send'],
				expiresAt: '2025-12-31T23:59:59Z',
				rateLimit: 1000,
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should enforce max name length', () => {
			const data = {
				name: 'a'.repeat(256),
				scopes: ['send'],
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate datetime format for expiresAt', () => {
			const data = {
				name: 'Test Key',
				scopes: ['send'],
				expiresAt: 'invalid-date',
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce rate limit constraints', () => {
			const data = {
				name: 'Test Key',
				scopes: ['send'],
				rateLimit: 20000,
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should accept all valid scopes', () => {
			const data = {
				name: 'Full Access Key',
				scopes: [
					'send',
					'templates:read',
					'templates:write',
					'subscribers:read',
					'subscribers:write',
					'keys:manage',
					'transports:manage',
					'usage:read',
					'webhooks:manage',
				],
			};

			const result = createApiKeySchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('updateApiKeySchema', () => {
		it('should validate partial updates', () => {
			const data = {
				name: 'Updated Name',
			};

			const result = updateApiKeySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate scope updates', () => {
			const data = {
				scopes: ['send', 'templates:read'],
			};

			const result = updateApiKeySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate multiple field updates', () => {
			const data = {
				name: 'Updated Key',
				description: 'Updated description',
				rateLimit: 5000,
			};

			const result = updateApiKeySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid scopes in update', () => {
			const data = {
				scopes: ['invalid_scope'],
			};

			const result = updateApiKeySchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('apiKeyQuerySchema', () => {
		it('should use default values', () => {
			const data = {};

			const result = apiKeyQuerySchema.parse(data);
			expect(result.page).toBe(1);
			expect(result.limit).toBe(20);
			expect(result.includeExpired).toBe(false);
		});

		it('should coerce string numbers to numbers', () => {
			const data = {
				page: '2',
				limit: '50',
			};

			const result = apiKeyQuerySchema.parse(data);
			expect(result.page).toBe(2);
			expect(result.limit).toBe(50);
		});

		it('should enforce minimum page number', () => {
			const data = {
				page: 0,
			};

			const result = apiKeyQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum limit', () => {
			const data = {
				limit: 150,
			};

			const result = apiKeyQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should coerce includeExpired to boolean', () => {
			const data = {
				includeExpired: 'true',
			};

			const result = apiKeyQuerySchema.parse(data);
			expect(result.includeExpired).toBe(true);
		});
	});

	describe('apiKeyScopeEnum', () => {
		it('should validate all valid scopes', () => {
			const validScopes = [
				'send',
				'templates:read',
				'templates:write',
				'subscribers:read',
				'subscribers:write',
				'keys:manage',
				'transports:manage',
				'usage:read',
				'webhooks:manage',
			];

			for (const scope of validScopes) {
				const result = apiKeyScopeEnum.safeParse(scope);
				expect(result.success).toBe(true);
			}
		});

		it('should reject invalid scopes', () => {
			const result = apiKeyScopeEnum.safeParse('invalid:scope');
			expect(result.success).toBe(false);
		});
	});
});
