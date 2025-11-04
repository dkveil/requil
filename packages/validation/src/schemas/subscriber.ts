import { z } from 'zod';

const emailSchema = z
	.string()
	.email({ message: 'Invalid email address format' });

/**
 * @example
 * {
 *   "email": "user@example.com",
 *   "tags": ["newsletter", "premium"],
 *   "attributes": {
 *     "firstName": "John",
 *     "plan": "pro"
 *   },
 *   "doubleOptIn": true
 * }
 */
export const createSubscriberSchema = z.object({
	email: emailSchema,
	name: z.string().max(255).optional(),
	tags: z.array(z.string()).max(20).optional(),
	attributes: z.record(z.string(), z.unknown()).optional(),
	doubleOptIn: z.boolean().optional().default(true),
	metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * @example
 * {
 *   "tags": ["vip"],
 *   "attributes": {
 *     "plan": "enterprise"
 *   }
 * }
 */
export const updateSubscriberSchema = z
	.object({
		name: z.string().max(255).optional(),
		tags: z.array(z.string()).max(20).optional(),
		attributes: z.record(z.string(), z.unknown()).optional(),
		metadata: z.record(z.string(), z.string()).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

/**
 * @example
 * [
 *   { "email": "user1@example.com", "tags": ["newsletter"] },
 *   { "email": "user2@example.com", "tags": ["premium"] }
 * ]
 */
export const bulkImportSubscribersSchema = z.object({
	subscribers: z.array(createSubscriberSchema).min(1).max(10000),
	updateOnConflict: z.boolean().optional().default(false),
});

export const subscriberQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	search: z.string().optional(),
	tags: z.array(z.string()).optional(),
	status: z
		.enum(['active', 'unsubscribed', 'bounced', 'complained'])
		.optional(),
	sortBy: z
		.enum(['createdAt', 'email', 'name'])
		.optional()
		.default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * @example
 * {
 *   "email": "user@example.com",
 *   "token": "unique-token-from-email-link"
 * }
 */
export const confirmSubscriptionSchema = z.object({
	email: emailSchema,
	token: z.string().min(1),
});

/**
 * @example
 * {
 *   "email": "user@example.com",
 *   "reason": "user_requested"
 * }
 */
export const unsubscribeSchema = z.object({
	email: emailSchema,
	reason: z
		.enum(['user_requested', 'hard_bounce', 'complaint', 'manual'])
		.optional()
		.default('user_requested'),
});

export type CreateSubscriber = z.infer<typeof createSubscriberSchema>;
export type UpdateSubscriber = z.infer<typeof updateSubscriberSchema>;
export type BulkImportSubscribers = z.infer<typeof bulkImportSubscribersSchema>;
export type SubscriberQuery = z.infer<typeof subscriberQuerySchema>;
export type ConfirmSubscription = z.infer<typeof confirmSubscriptionSchema>;
export type Unsubscribe = z.infer<typeof unsubscribeSchema>;
