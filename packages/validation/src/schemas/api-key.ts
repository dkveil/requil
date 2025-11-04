import { z } from 'zod';

export const apiKeyScopeEnum = z.enum([
	'send',
	'templates:read',
	'templates:write',
	'subscribers:read',
	'subscribers:write',
	'keys:manage',
	'transports:manage',
	'usage:read',
	'webhooks:manage',
]);

/**
 * @example
 * {
 *   "name": "Production API Key",
 *   "scopes": ["send", "templates:read"],
 *   "expiresAt": "2025-12-31T23:59:59Z"
 * }
 */
export const createApiKeySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	scopes: z.array(apiKeyScopeEnum).min(1, 'At least one scope is required'),
	expiresAt: z.iso.datetime().optional(),
	rateLimit: z.number().min(1).max(10000).optional(),
});

/**
 * @example
 * {
 *   "name": "Updated API Key Name",
 *   "scopes": ["send", "templates:read", "templates:write"]
 * }
 */
export const updateApiKeySchema = z
	.object({
		name: z.string().min(1).max(255).optional(),
		description: z.string().max(1000).optional(),
		scopes: z.array(apiKeyScopeEnum).min(1).optional(),
		expiresAt: z.iso.datetime().optional(),
		rateLimit: z.number().min(1).max(10000).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

export const apiKeyQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	includeExpired: z.coerce.boolean().optional().default(false),
});

export type CreateApiKey = z.infer<typeof createApiKeySchema>;
export type UpdateApiKey = z.infer<typeof updateApiKeySchema>;
export type ApiKeyQuery = z.infer<typeof apiKeyQuerySchema>;
export type ApiKeyScope = z.infer<typeof apiKeyScopeEnum>;
