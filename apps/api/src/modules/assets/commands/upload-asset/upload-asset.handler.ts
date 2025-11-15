import type {
	UploadAssetInput as BaseUploadAssetInput,
	UploadAssetResponse,
} from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { assetsActionCreator } from '../..';
import { AssetEntity } from '../../domain/asset.domain';
import {
	AssetUploadError,
	AssetValidationError,
} from '../../domain/asset.error';

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

const ALLOWED_MIME_TYPES = {
	image: IMAGE_MIME_TYPES,
	font: FONT_MIME_TYPES,
} as const;

interface UploadAssetInput extends BaseUploadAssetInput {
	file: {
		filename: string;
		mimetype: string;
		buffer: Buffer;
	};
}

const validateFile = (
	file: UploadAssetInput['file'],
	type: 'image' | 'font'
): void => {
	if (!file.mimetype) {
		throw new AssetValidationError('File mimetype is required');
	}

	const allowedMimeTypes = ALLOWED_MIME_TYPES[type] as readonly string[];
	if (!allowedMimeTypes.includes(file.mimetype)) {
		throw new AssetValidationError(
			`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
			{ mimeType: file.mimetype }
		);
	}

	if (file.buffer.length > MAX_FILE_SIZE) {
		throw new AssetValidationError(
			`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
			{ sizeBytes: file.buffer.length }
		);
	}
};

export const uploadAssetAction =
	assetsActionCreator<UploadAssetInput>('UPLOAD_ASSET');

export default function uploadAssetHandler({
	commandBus,
	assetRepository,
	workspaceRepository,
	logger,
	supabase,
}: Dependencies) {
	const handler = async (
		action: Action<UploadAssetInput>
	): Promise<UploadAssetResponse> => {
		const { workspaceId, type, alt, file } = action.payload;
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		logger.info({ workspaceId, type }, 'Uploading asset');

		const workspace = await workspaceRepository.findByIdWithRole(
			workspaceId,
			userId
		);

		if (!workspace) {
			throw new AssetUploadError('Workspace not found or access denied', {
				workspaceId,
			});
		}

		validateFile(file, type);

		const newAsset = AssetEntity.create(
			workspaceId,
			type,
			file.filename,
			file.mimetype,
			file.buffer.length,
			userId,
			alt
		);

		const createdAsset = await assetRepository.create(newAsset);

		const bucketName = type === 'image' ? 'images' : 'fonts';
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from(bucketName)
			.upload(createdAsset.storagePath, file.buffer, {
				contentType: file.mimetype,
				upsert: false,
			});

		if (uploadError || !uploadData) {
			logger.error(
				{ error: uploadError, assetId: createdAsset.id },
				'Failed to upload to Supabase Storage'
			);
			await assetRepository.updateStatus(createdAsset.id, 'error');
			throw new AssetUploadError('Failed to upload file to storage', {
				error: uploadError?.message,
			});
		}

		const { data: publicUrlData } = supabase.storage
			.from(bucketName)
			.getPublicUrl(createdAsset.storagePath);

		const updatedAsset = await assetRepository.updateStatus(
			createdAsset.id,
			'ready',
			publicUrlData.publicUrl
		);

		logger.info(
			{ assetId: updatedAsset.id, workspaceId, userId },
			'Asset uploaded successfully'
		);

		return {
			id: updatedAsset.id,
			workspaceId: updatedAsset.workspaceId,
			type: updatedAsset.type,
			status: updatedAsset.status,
			filename: updatedAsset.filename,
			originalFilename: updatedAsset.originalFilename,
			mimeType: updatedAsset.mimeType,
			sizeBytes: updatedAsset.sizeBytes,
			storagePath: updatedAsset.storagePath,
			publicUrl: updatedAsset.publicUrl,
			width: updatedAsset.width,
			height: updatedAsset.height,
			alt: updatedAsset.alt,
			uploadedBy: updatedAsset.uploadedBy,
			createdAt: updatedAsset.createdAt,
			updatedAt: updatedAsset.updatedAt,
		};
	};

	const init = async () => {
		commandBus.register(uploadAssetAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
