import { describe, expect, it } from 'vitest';
import {
	createTransportSchema,
	updateTransportSchema,
	verifyTransportSchema,
} from '../transport';

describe('transport schemas', () => {
	describe('createTransportSchema', () => {
		it('should validate Resend transport', () => {
			const data = {
				name: 'Production Resend',
				type: 'resend',
				config: {
					apiKey: 're_xxxxxxxxxxxx',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate SMTP transport', () => {
			const data = {
				name: 'AWS SES',
				type: 'smtp',
				config: {
					host: 'email-smtp.us-east-1.amazonaws.com',
					port: 587,
					secure: true,
					username: 'AKIAXXXXXXXX',
					password: 'secret',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default values', () => {
			const data = {
				name: 'Test Transport',
				type: 'resend',
				config: {
					apiKey: 'test-key',
				},
			};

			const result = createTransportSchema.parse(data);
			expect(result.isDefault).toBe(false);
		});

		it('should reject mismatched config type (Resend config with SMTP type)', () => {
			const data = {
				name: 'Invalid',
				type: 'smtp',
				config: {
					apiKey: 're_xxxxxxxxxxxx',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject mismatched config type (SMTP config with Resend type)', () => {
			const data = {
				name: 'Invalid',
				type: 'resend',
				config: {
					host: 'smtp.example.com',
					port: 587,
					secure: true,
					username: 'user',
					password: 'pass',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with optional fields', () => {
			const data = {
				name: 'Production Resend',
				type: 'resend',
				config: {
					apiKey: 're_xxxxxxxxxxxx',
				},
				isDefault: true,
				dailyLimit: 10000,
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should enforce minimum daily limit', () => {
			const data = {
				name: 'Test',
				type: 'resend',
				config: {
					apiKey: 'test',
				},
				dailyLimit: 0,
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require Resend API key', () => {
			const data = {
				name: 'Test',
				type: 'resend',
				config: {},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require SMTP host', () => {
			const data = {
				name: 'Test',
				type: 'smtp',
				config: {
					port: 587,
					secure: true,
					username: 'user',
					password: 'pass',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce SMTP port range', () => {
			const data = {
				name: 'Test',
				type: 'smtp',
				config: {
					host: 'smtp.example.com',
					port: 99999,
					secure: true,
					username: 'user',
					password: 'pass',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should apply default secure value for SMTP', () => {
			const data = {
				name: 'Test',
				type: 'smtp',
				config: {
					host: 'smtp.example.com',
					port: 587,
					username: 'user',
					password: 'pass',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
			if (result.success && result.data.type === 'smtp') {
				expect(result.data.config.secure).toBe(true);
			}
		});

		it('should enforce name length', () => {
			const data = {
				name: 'a'.repeat(256),
				type: 'resend',
				config: {
					apiKey: 'test',
				},
			};

			const result = createTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateTransportSchema', () => {
		it('should validate partial updates', () => {
			const data = {
				name: 'Updated Transport Name',
			};

			const result = updateTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate config update', () => {
			const data = {
				config: {
					apiKey: 're_new_key',
				},
			};

			const result = updateTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate isDefault update', () => {
			const data = {
				isDefault: true,
			};

			const result = updateTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate daily limit update', () => {
			const data = {
				dailyLimit: 50000,
			};

			const result = updateTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate multiple field updates', () => {
			const data = {
				name: 'Updated Name',
				dailyLimit: 25000,
				isDefault: true,
			};

			const result = updateTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('verifyTransportSchema', () => {
		it('should validate verify request', () => {
			const data = {
				transportId: '123e4567-e89b-12d3-a456-426614174000',
			};

			const result = verifyTransportSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require valid UUID', () => {
			const data = {
				transportId: 'invalid-uuid',
			};

			const result = verifyTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require transportId', () => {
			const data = {};

			const result = verifyTransportSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});
});
