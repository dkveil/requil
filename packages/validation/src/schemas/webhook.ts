import { z } from 'zod';

export const webhookEventEnum = z.enum([
	'email.sent',
	'email.delivered',
	'email.opened',
	'email.clicked',
	'email.bounced',
	'email.complained',
	'email.failed',
]);

/**
 * @example
 * {
 *   "url": "https://api.example.com/webhooks/email",
 *   "events": ["email.delivered", "email.bounced"],
 *   "secret": "whsec_xxxxxxxxxx"
 * }
 */
export const createWebhookSchema = z.object({
	url: z.string().url({ message: 'Invalid webhook URL' }),
	description: z.string().max(1000).optional(),
	events: z.array(webhookEventEnum).min(1, 'At least one event is required'),
	secret: z
		.string()
		.min(16, 'Secret must be at least 16 characters')
		.max(255)
		.optional(),
	enabled: z.boolean().optional().default(true),
});

/**
 * @example
 * {
 *   "url": "https://api.example.com/webhooks/email-v2",
 *   "events": ["email.delivered", "email.bounced", "email.complained"]
 * }
 */
export const updateWebhookSchema = z
	.object({
		url: z.string().url().optional(),
		description: z.string().max(1000).optional(),
		events: z.array(webhookEventEnum).min(1).optional(),
		secret: z.string().min(16).max(255).optional(),
		enabled: z.boolean().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

/**
 * @example
 * {
 *   "event": "email.delivered",
 *   "payload": {
 *     "messageId": "msg_abc123",
 *     "email": "user@example.com",
 *     "timestamp": "2025-01-15T10:30:00Z"
 *   }
 * }
 */
export const testWebhookSchema = z.object({
	webhookId: z.string().uuid(),
	event: webhookEventEnum,
	payload: z.record(z.unknown()).optional(),
});

export const webhookQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	enabled: z.coerce.boolean().optional(),
});

export type CreateWebhook = z.infer<typeof createWebhookSchema>;
export type UpdateWebhook = z.infer<typeof updateWebhookSchema>;
export type TestWebhook = z.infer<typeof testWebhookSchema>;
export type WebhookQuery = z.infer<typeof webhookQuerySchema>;
export type WebhookEvent = z.infer<typeof webhookEventEnum>;
