import { z } from 'zod';

const SLUG_REGEX = /^[a-z0-9-]+$/;

export const createWorkspaceSchema = z.object({
	name: z.string().min(2).max(255),
	slug: z
		.string()
		.min(3)
		.max(63)
		.regex(
			SLUG_REGEX,
			'Slug must contain only lowercase letters, numbers, and hyphens'
		),
});

export const createWorkspaceResponseSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
	createdBy: z.uuid(),
	createdAt: z.string(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateWorkspaceResponse = z.infer<
	typeof createWorkspaceResponseSchema
>;
