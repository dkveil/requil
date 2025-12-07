import { z } from 'zod';
import { DocumentSchema } from '../editor/block-ir.schema';

export const getTemplateQuerySchema = z.object({
	id: z.uuid(),
});

export const templateResponseSchema = z.object({
	id: z.uuid(),
	workspaceId: z.uuid(),
	stableId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	document: DocumentSchema.nullable(),
	variablesSchema: z.record(z.string(), z.any()).nullable(),
	subjectLines: z.array(z.string()).nullable(),
	preheader: z.string().nullable(),
	createdBy: z.uuid(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type GetTemplateQuery = z.infer<typeof getTemplateQuerySchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;
