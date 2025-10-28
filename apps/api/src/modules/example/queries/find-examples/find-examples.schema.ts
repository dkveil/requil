import { z } from 'zod';

export const findExamplesQuerySchema = z.object({
	page: z.coerce.number().min(0).default(0),
	limit: z.coerce.number().min(1).max(100).default(20),
	orderBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
	orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

export const findExamplesResponseSchema = z.object({
	data: z.array(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
			createdAt: z.string().datetime(),
			updatedAt: z.string().datetime(),
		})
	),
	pagination: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
		totalPages: z.number(),
	}),
});

export type FindExamplesQuery = z.infer<typeof findExamplesQuerySchema>;
export type FindExamplesResponse = z.infer<typeof findExamplesResponseSchema>;
