import { z } from 'zod';

export const deleteAssetParamsSchema = z.object({
	workspaceId: z.string().uuid(),
	id: z.string().uuid(),
});

export const deleteAssetInputSchema = deleteAssetParamsSchema;

export const deleteAssetResponseSchema = z.object({
	success: z.boolean(),
});

export type DeleteAssetParams = z.infer<typeof deleteAssetParamsSchema>;
export type DeleteAssetInput = z.infer<typeof deleteAssetInputSchema>;
export type DeleteAssetResponse = z.infer<typeof deleteAssetResponseSchema>;
