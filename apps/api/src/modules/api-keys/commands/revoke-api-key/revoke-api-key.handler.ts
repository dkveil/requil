import type { RevokeApiKeyParams } from '@requil/types/api-keys';
import type { Action } from '@/shared/cqrs/bus.types';
import { ApiKeyNotFoundError } from '../../domain/api-key.error';
import { apiKeyActionCreator } from '../../index';

export const revokeApiKeyAction =
	apiKeyActionCreator<RevokeApiKeyParams>('REVOKE_API_KEY');

export default function revokeApiKeyHandler({
	commandBus,
	apiKeyRepository,
	logger,
}: Dependencies) {
	const handler = async (action: Action<RevokeApiKeyParams>): Promise<void> => {
		logger.info({ payload: action.payload }, 'Revoking API key');

		const workspaceId = action.meta?.workspaceId as string;

		if (!workspaceId) {
			throw new Error('Workspace ID is required');
		}

		const { keyId } = action.payload;

		const existingKey = await apiKeyRepository.findByIdWithScopes(
			keyId,
			workspaceId
		);

		if (!existingKey) {
			throw new ApiKeyNotFoundError('API key not found', {
				keyId,
				workspaceId,
			});
		}

		await apiKeyRepository.revoke(keyId, workspaceId);

		logger.info(
			{ apiKeyId: keyId, workspaceId },
			'API key revoked successfully'
		);
	};

	const init = async () => {
		commandBus.register(revokeApiKeyAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
