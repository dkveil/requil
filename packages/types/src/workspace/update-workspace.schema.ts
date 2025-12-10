import { z } from 'zod';

const SLUG_REGEX = /^[a-z0-9-]+$/;

export const updateWorkspaceSchema = z
	.object({
		name: z.string().min(1).max(100).optional(),
		slug: z
			.string()
			.min(3)
			.max(63)
			.regex(
				SLUG_REGEX,
				'Slug must contain only lowercase letters, numbers, and hyphens'
			)
			.optional(),
	})
	.refine((data) => data.name !== undefined || data.slug !== undefined, {
		message: 'At least one field (name or slug) must be provided',
	});

export const updateWorkspaceResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	createdBy: z.string().uuid(),
	createdAt: z.string(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type UpdateWorkspaceResponse = z.infer<
	typeof updateWorkspaceResponseSchema
>;
