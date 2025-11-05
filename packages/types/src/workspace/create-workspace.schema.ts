import { z } from 'zod';

export const createWorkspaceSchema = z.object({
	name: z.string().min(2).max(255),
});

export const createWorkspaceResponseSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	createdBy: z.uuid(),
	createdAt: z.string(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateWorkspaceResponse = z.infer<
	typeof createWorkspaceResponseSchema
>;
