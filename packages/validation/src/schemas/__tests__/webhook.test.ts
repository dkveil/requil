import { describe, expect, it } from 'vitest';
import {
	createWebhookSchema,
	testWebhookSchema,
	updateWebhookSchema,
	webhookEventEnum,
	webhookQuerySchema,
} from '../webhook';

describe('webhook schemas', () => {
	describe('webhookEventEnum', () => {
		it('should validate all valid events', () => {
			const validEvents = [
				'email.sent',
				'email.delivered',
				'email.opened',
				'email.clicked',
				'email.bounced',
				'email.complained',
				'email.failed',
			];

			for (const event of validEvents) {
				const result = webhookEventEnum.safeParse(event);
				expect(result.success).toBe(true);
			}
		});

		it('should reject invalid events', () => {
			const result = webhookEventEnum.safeParse('email.invalid');
			expect(result.success).toBe(false);
		});
	});

	describe('createWebhookSchema', () => {
		it('should validate webhook with required fields', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: ['email.delivered', 'email.bounced'],
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default enabled value', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: ['email.delivered'],
			};

			const result = createWebhookSchema.parse(data);
			expect(result.enabled).toBe(true);
		});

		it('should validate with optional fields', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				description: 'Production webhook for email events',
				events: ['email.delivered', 'email.bounced'],
				secret: 'whsec_xxxxxxxxxx',
				enabled: false,
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require valid URL', () => {
			const data = {
				url: 'not-a-url',
				events: ['email.delivered'],
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require at least one event', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: [],
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce minimum secret length', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: ['email.delivered'],
				secret: 'short',
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum secret length', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: ['email.delivered'],
				secret: 'a'.repeat(256),
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce description length', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: ['email.delivered'],
				description: 'a'.repeat(1001),
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject invalid events', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email',
				events: ['email.invalid'],
			};

			const result = createWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateWebhookSchema', () => {
		it('should validate partial updates', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email-v2',
			};

			const result = updateWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate events update', () => {
			const data = {
				events: ['email.delivered', 'email.bounced', 'email.complained'],
			};

			const result = updateWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate enabled toggle', () => {
			const data = {
				enabled: false,
			};

			const result = updateWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate multiple field updates', () => {
			const data = {
				url: 'https://api.example.com/webhooks/email-v2',
				events: ['email.delivered'],
				enabled: true,
			};

			const result = updateWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require at least one event if events provided', () => {
			const data = {
				events: [],
			};

			const result = updateWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('testWebhookSchema', () => {
		it('should validate test request', () => {
			const data = {
				webhookId: '123e4567-e89b-12d3-a456-426614174000',
				event: 'email.delivered',
			};

			const result = testWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with custom payload', () => {
			const data = {
				webhookId: '123e4567-e89b-12d3-a456-426614174000',
				event: 'email.delivered',
				payload: {
					messageId: 'msg_abc123',
					email: 'user@example.com',
					timestamp: '2025-01-15T10:30:00Z',
				},
			};

			const result = testWebhookSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require valid UUID', () => {
			const data = {
				webhookId: 'invalid-uuid',
				event: 'email.delivered',
			};

			const result = testWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require valid event', () => {
			const data = {
				webhookId: '123e4567-e89b-12d3-a456-426614174000',
				event: 'invalid.event',
			};

			const result = testWebhookSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('webhookQuerySchema', () => {
		it('should use default values', () => {
			const data = {};

			const result = webhookQuerySchema.parse(data);
			expect(result.page).toBe(1);
			expect(result.limit).toBe(20);
		});

		it('should coerce query parameters', () => {
			const data = {
				page: '2',
				limit: '50',
			};

			const result = webhookQuerySchema.parse(data);
			expect(result.page).toBe(2);
			expect(result.limit).toBe(50);
		});

		it('should validate enabled filter', () => {
			const data = {
				enabled: 'true',
			};

			const result = webhookQuerySchema.parse(data);
			expect(result.enabled).toBe(true);
		});

		it('should enforce minimum page', () => {
			const data = {
				page: 0,
			};

			const result = webhookQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum limit', () => {
			const data = {
				limit: 150,
			};

			const result = webhookQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});
});
