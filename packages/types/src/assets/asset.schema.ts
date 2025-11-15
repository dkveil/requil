import { z } from 'zod';

export const assetTypeSchema = z.enum(['image', 'font']);

export const assetStatusSchema = z.enum(['uploading', 'ready', 'error']);

export const assetSchema = z.object({
	id: z.string().uuid(),
	workspaceId: z.string().uuid(),
	type: assetTypeSchema,
	status: assetStatusSchema,
	filename: z.string(),
	originalFilename: z.string(),
	mimeType: z.string(),
	sizeBytes: z.number().int().positive(),
	storagePath: z.string(),
	publicUrl: z.string().url().nullable(),
	width: z.number().int().positive().nullable(),
	height: z.number().int().positive().nullable(),
	alt: z.string().nullable(),
	uploadedBy: z.string().uuid(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Asset = z.infer<typeof assetSchema>;
export type AssetType = z.infer<typeof assetTypeSchema>;
export type AssetStatus = z.infer<typeof assetStatusSchema>;
