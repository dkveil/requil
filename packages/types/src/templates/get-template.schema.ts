import { z } from 'zod';

export const getTemplateQuerySchema = z.object({
	id: z.uuid(),
});

export const templateResponseSchema = z.object({
	id: z.uuid(),
	workspaceId: z.uuid(),
	stableId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	builderStructure: z.record(z.string(), z.any()).nullable(),
	mjml: z.string().nullable(),
	variablesSchema: z.record(z.string(), z.any()).nullable(),
	subjectLines: z.array(z.string()).nullable(),
	preheader: z.string().nullable(),
	createdBy: z.uuid(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type GetTemplateQuery = z.infer<typeof getTemplateQuerySchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;
