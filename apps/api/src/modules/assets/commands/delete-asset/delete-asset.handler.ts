import type { DeleteAssetInput, DeleteAssetResponse } from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { assetsActionCreator } from '../..';
import {
	AssetAccessDeniedError,
	AssetDeleteError,
	AssetNotFoundError,
} from '../../domain/asset.error';

export const deleteAssetAction =
	assetsActionCreator<DeleteAssetInput>('DELETE_ASSET');

export default function deleteAssetHandler({
	commandBus,
	assetRepository,
	workspaceRepository,
	logger,
	supabase,
}: Dependencies) {
	const handler = async (
		action: Action<DeleteAssetInput>
	): Promise<DeleteAssetResponse> => {
		const { id, workspaceId } = action.payload;
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		logger.info({ id, workspaceId }, 'Deleting asset');

		const workspace = await workspaceRepository.findByIdWithRole(
			workspaceId,
			userId
		);

		if (!workspace) {
			throw new AssetAccessDeniedError('Workspace not found or access denied', {
				workspaceId,
			});
		}

		const asset = await assetRepository.findById(id);

		if (!asset) {
			throw new AssetNotFoundError('Asset not found', { id });
		}

		if (asset.workspaceId !== workspaceId) {
			throw new AssetAccessDeniedError('Asset does not belong to workspace', {
				id,
				workspaceId,
			});
		}

		const bucketName = asset.type === 'image' ? 'images' : 'fonts';
		const { error: deleteError } = await supabase.storage
			.from(bucketName)
			.remove([asset.storagePath]);

		if (deleteError) {
			logger.error(
				{ error: deleteError, assetId: id },
				'Failed to delete from Supabase Storage'
			);
			throw new AssetDeleteError('Failed to delete file from storage', {
				error: deleteError.message,
			});
		}

		await assetRepository.delete(id);

		logger.info({ id, workspaceId, userId }, 'Asset deleted successfully');

		return {
			success: true,
		};
	};

	const init = async () => {
		commandBus.register(deleteAssetAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
