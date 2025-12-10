import { z } from 'zod';

export const listApiKeysQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	includeRevoked: z.coerce.boolean().optional().default(false),
});

export const apiKeyItemSchema = z.object({
	id: z.string().uuid(),
	keyPrefix: z.string(),
	name: z.string(),
	scopes: z.array(z.string()),
	createdAt: z.string().datetime(),
	lastUsedAt: z.string().datetime().nullable(),
	expiresAt: z.string().datetime().nullable(),
	revokedAt: z.string().datetime().nullable(),
});

export const listApiKeysResponseSchema = z.object({
	data: z.array(apiKeyItemSchema),
	meta: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
	}),
});

export type ListApiKeysQuery = z.infer<typeof listApiKeysQuerySchema>;
export type ApiKeyItem = z.infer<typeof apiKeyItemSchema>;
export type ListApiKeysResponse = z.infer<typeof listApiKeysResponseSchema>;
