import { z } from 'zod';

export const findWorkspaceTemplatesQuerySchema = z.object({
	workspaceId: z.uuid(),
});

export const templateItemSchema = z.object({
	id: z.uuid(),
	workspaceId: z.uuid(),
	stableId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	createdBy: z.uuid(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const findWorkspaceTemplatesResponseSchema = z.object({
	templates: z.array(templateItemSchema),
});

export type FindWorkspaceTemplatesQuery = z.infer<
	typeof findWorkspaceTemplatesQuerySchema
>;
export type TemplateItem = z.infer<typeof templateItemSchema>;
export type FindWorkspaceTemplatesResponse = z.infer<
	typeof findWorkspaceTemplatesResponseSchema
>;
