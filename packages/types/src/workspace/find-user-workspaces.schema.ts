import { z } from 'zod';

export const userWorkspaceSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
	role: z.enum(['owner', 'admin', 'member']),
	createdAt: z.string(),
});

export const findUserWorkspacesResponseSchema = z.object({
	workspaces: z.array(userWorkspaceSchema),
	total: z.number(),
});

export type UserWorkspace = z.infer<typeof userWorkspaceSchema>;
export type FindUserWorkspacesResponse = z.infer<
	typeof findUserWorkspacesResponseSchema
>;
