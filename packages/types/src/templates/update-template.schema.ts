import { z } from 'zod';
import { DocumentSchema } from '../editor/block-ir.schema';

export const updateTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(1000).optional(),
	document: z.record(z.string(), z.any()).optional(),
	variablesSchema: z.record(z.string(), z.any()).optional(),
	subjectLines: z.array(z.string()).max(5).optional(),
	preheader: z.string().max(255).optional(),
});

export const updateTemplateParamsSchema = z.object({
	id: z.uuid('Invalid template ID'),
});

export const updateTemplateResponseSchema = z.object({
	id: z.uuid(),
	workspaceId: z.uuid(),
	stableId: z.string(),
	name: z.string(),
	description: z.string().max(1000).nullable(),
	updatedAt: z.string(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type UpdateTemplateParams = z.infer<typeof updateTemplateParamsSchema>;
export type UpdateTemplateResponse = z.infer<
	typeof updateTemplateResponseSchema
>;
