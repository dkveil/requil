import { z } from 'zod';
import { assetSchema, assetTypeSchema } from './asset.schema';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IMAGE_MIME_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/svg+xml',
] as const;

const FONT_MIME_TYPES = [
	'font/woff',
	'font/woff2',
	'font/ttf',
	'font/otf',
	'application/font-woff',
	'application/font-woff2',
	'application/x-font-ttf',
	'application/x-font-otf',
] as const;

export const uploadAssetInputSchema = z.object({
	workspaceId: z.string().uuid(),
	type: assetTypeSchema,
	alt: z.string().optional(),
});

export const uploadAssetResponseSchema = assetSchema;

export type UploadAssetInput = z.infer<typeof uploadAssetInputSchema>;
export type UploadAssetResponse = z.infer<typeof uploadAssetResponseSchema>;

export const ALLOWED_MIME_TYPES = {
	image: IMAGE_MIME_TYPES,
	font: FONT_MIME_TYPES,
} as const;

export { MAX_FILE_SIZE };
