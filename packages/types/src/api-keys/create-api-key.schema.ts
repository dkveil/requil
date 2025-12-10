import { z } from 'zod';

export const createApiKeySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	scopes: z
		.array(
			z.enum([
				'send',
				'templates:read',
				'templates:write',
				'subscribers:read',
				'subscribers:write',
				'keys:manage',
				'transports:manage',
				'usage:read',
				'webhooks:manage',
			])
		)
		.min(1, 'At least one scope is required'),
	expiresAt: z.string().datetime().optional(),
});

export const createApiKeyResponseSchema = z.object({
	id: z.string().uuid(),
	key: z.string(),
	keyPrefix: z.string(),
	name: z.string(),
	scopes: z.array(z.string()),
	createdAt: z.string().datetime(),
	lastUsedAt: z.string().datetime().nullable(),
	expiresAt: z.string().datetime().nullable(),
	revokedAt: z.string().datetime().nullable(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type CreateApiKeyResponse = z.infer<typeof createApiKeyResponseSchema>;
