import { describe, expect, it } from 'vitest';
import {
	bulkImportSubscribersSchema,
	confirmSubscriptionSchema,
	createSubscriberSchema,
	subscriberQuerySchema,
	unsubscribeSchema,
	updateSubscriberSchema,
} from '../subscriber';

describe('subscriber schemas', () => {
	describe('createSubscriberSchema', () => {
		it('should validate subscriber with required fields', () => {
			const data = {
				email: 'user@example.com',
			};

			const result = createSubscriberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default doubleOptIn', () => {
			const data = {
				email: 'user@example.com',
			};

			const result = createSubscriberSchema.parse(data);
			expect(result.doubleOptIn).toBe(true);
		});

		it('should validate with all optional fields', () => {
			const data = {
				email: 'user@example.com',
				name: 'John Doe',
				tags: ['newsletter', 'premium'],
				attributes: { plan: 'pro', country: 'US' },
				doubleOptIn: false,
				metadata: { source: 'website' },
			};

			const result = createSubscriberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email', () => {
			const data = {
				email: 'invalid-email',
			};

			const result = createSubscriberSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum tags', () => {
			const data = {
				email: 'user@example.com',
				tags: Array(21).fill('tag'),
			};

			const result = createSubscriberSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce name length', () => {
			const data = {
				email: 'user@example.com',
				name: 'a'.repeat(256),
			};

			const result = createSubscriberSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateSubscriberSchema', () => {
		it('should validate partial updates', () => {
			const data = {
				name: 'Updated Name',
			};

			const result = updateSubscriberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateSubscriberSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate tags update', () => {
			const data = {
				tags: ['vip', 'premium'],
			};

			const result = updateSubscriberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate attributes update', () => {
			const data = {
				attributes: { plan: 'enterprise', seats: 10 },
			};

			const result = updateSubscriberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('bulkImportSubscribersSchema', () => {
		it('should validate bulk import', () => {
			const data = {
				subscribers: [
					{ email: 'user1@example.com' },
					{ email: 'user2@example.com' },
				],
			};

			const result = bulkImportSubscribersSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default updateOnConflict', () => {
			const data = {
				subscribers: [{ email: 'user@example.com' }],
			};

			const result = bulkImportSubscribersSchema.parse(data);
			expect(result.updateOnConflict).toBe(false);
		});

		it('should require at least one subscriber', () => {
			const data = {
				subscribers: [],
			};

			const result = bulkImportSubscribersSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum subscribers', () => {
			const data = {
				subscribers: Array(10001)
					.fill(null)
					.map((_, i) => ({ email: `user${i}@example.com` })),
			};

			const result = bulkImportSubscribersSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with updateOnConflict', () => {
			const data = {
				subscribers: [{ email: 'user@example.com' }],
				updateOnConflict: true,
			};

			const result = bulkImportSubscribersSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('subscriberQuerySchema', () => {
		it('should use default values', () => {
			const data = {};

			const result = subscriberQuerySchema.parse(data);
			expect(result.page).toBe(1);
			expect(result.limit).toBe(20);
			expect(result.sortBy).toBe('createdAt');
			expect(result.sortOrder).toBe('desc');
		});

		it('should coerce query parameters', () => {
			const data = {
				page: '2',
				limit: '50',
			};

			const result = subscriberQuerySchema.parse(data);
			expect(result.page).toBe(2);
			expect(result.limit).toBe(50);
		});

		it('should validate search parameter', () => {
			const data = {
				search: 'john',
			};

			const result = subscriberQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate tags filter', () => {
			const data = {
				tags: ['newsletter', 'premium'],
			};

			const result = subscriberQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate status filter', () => {
			const data = {
				status: 'active',
			};

			const result = subscriberQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid status', () => {
			const data = {
				status: 'invalid_status',
			};

			const result = subscriberQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate sortBy options', () => {
			const validSortBy = ['createdAt', 'email', 'name'];

			for (const sortBy of validSortBy) {
				const result = subscriberQuerySchema.safeParse({ sortBy });
				expect(result.success).toBe(true);
			}
		});
	});

	describe('confirmSubscriptionSchema', () => {
		it('should validate confirmation data', () => {
			const data = {
				email: 'user@example.com',
				token: 'confirmation-token-123',
			};

			const result = confirmSubscriptionSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require email', () => {
			const data = {
				token: 'confirmation-token-123',
			};

			const result = confirmSubscriptionSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require token', () => {
			const data = {
				email: 'user@example.com',
			};

			const result = confirmSubscriptionSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject invalid email', () => {
			const data = {
				email: 'invalid-email',
				token: 'token',
			};

			const result = confirmSubscriptionSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('unsubscribeSchema', () => {
		it('should validate with default reason', () => {
			const data = {
				email: 'user@example.com',
			};

			const result = unsubscribeSchema.parse(data);
			expect(result.reason).toBe('user_requested');
		});

		it('should validate with custom reason', () => {
			const data = {
				email: 'user@example.com',
				reason: 'hard_bounce',
			};

			const result = unsubscribeSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate all valid reasons', () => {
			const validReasons = [
				'user_requested',
				'hard_bounce',
				'complaint',
				'manual',
			];

			for (const reason of validReasons) {
				const result = unsubscribeSchema.safeParse({
					email: 'user@example.com',
					reason,
				});
				expect(result.success).toBe(true);
			}
		});

		it('should reject invalid reason', () => {
			const data = {
				email: 'user@example.com',
				reason: 'invalid_reason',
			};

			const result = unsubscribeSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});
});
