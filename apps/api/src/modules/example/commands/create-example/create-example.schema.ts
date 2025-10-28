import { z } from 'zod';

export const createExampleBodySchema = z.object({
	name: z.string().min(3).max(100).trim(),
});

export const createExampleResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type CreateExampleBody = z.infer<typeof createExampleBodySchema>;
export type CreateExampleResponse = z.infer<typeof createExampleResponseSchema>;
