import { z } from 'zod';
import { paginationSchema } from '../api';
import { assetSchema, assetTypeSchema } from './asset.schema';

export const findAssetsParamsSchema = z.object({
	workspaceId: z.string().uuid(),
});

export const findAssetsQuerySchema = z.object({
	type: assetTypeSchema.optional(),
	search: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(50),
});

export const findAssetsInputSchema = findAssetsParamsSchema.merge(
	findAssetsQuerySchema
);

export const findAssetsResponseSchema = z.object({
	data: z.array(assetSchema),
	meta: paginationSchema,
});

export type FindAssetsParams = z.infer<typeof findAssetsParamsSchema>;
export type FindAssetsQuery = z.infer<typeof findAssetsQuerySchema>;
export type FindAssetsInput = z.infer<typeof findAssetsInputSchema>;
export type FindAssetsResponse = z.infer<typeof findAssetsResponseSchema>;
