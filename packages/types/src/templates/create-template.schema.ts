import { z } from 'zod';
import { DocumentSchema } from '../editor/block-ir.schema';

const STABLE_ID_REGEX = /^[a-z0-9-]+$/;

export const createTemplateSchema = z.object({
	workspaceId: z.uuid('Invalid workspace ID'),
	stableId: z
		.string()
		.min(3, 'Stable ID is required')
		.max(100)
		.regex(STABLE_ID_REGEX, 'Invalid stable ID'),
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	document: DocumentSchema.optional(),
	variablesSchema: z.record(z.string(), z.any()).optional(),
	subjectLines: z
		.array(z.string())
		.min(1, 'At least one subject line is required')
		.max(5)
		.optional(),
	preheader: z.string().max(255).optional(),
});

export const createTemplateResponseSchema = z.object({
	id: z.uuid(),
	workspaceId: z.uuid(),
	stableId: z.string(),
	name: z.string(),
	description: z.string().max(1000).nullable(),
	createdBy: z.uuid(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateTemplateResponse = z.infer<
	typeof createTemplateResponseSchema
>;
