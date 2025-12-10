import type {
	CreateApiKeyInput,
	CreateApiKeyResponse,
} from '@requil/types/api-keys';
import { generateApiKey } from '@requil/utils/crypto';
import type { Action } from '@/shared/cqrs/bus.types';
import { ApiKeyEntity } from '../../domain/api-key.domain';
import type { ApiKeyScope } from '../../domain/api-key.types';
import { apiKeyActionCreator } from '../../index';

export const createApiKeyAction =
	apiKeyActionCreator<CreateApiKeyInput>('CREATE_API_KEY');

export default function createApiKeyHandler({
	commandBus,
	apiKeyRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<CreateApiKeyInput>
	): Promise<CreateApiKeyResponse> => {
		logger.info({ payload: action.payload }, 'Creating API key');

		const userId = action.meta?.userId as string;
		const workspaceId = action.meta?.workspaceId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		if (!workspaceId) {
			throw new Error('Workspace ID is required');
		}

		const { key, prefix, hash } = await generateApiKey();

		const expiresAt = action.payload.expiresAt
			? new Date(action.payload.expiresAt)
			: undefined;

		const apiKeyEntity = ApiKeyEntity.create(
			{
				name: action.payload.name,
				scopes: action.payload.scopes as ApiKeyScope[],
				expiresAt,
			},
			workspaceId,
			userId,
			prefix,
			hash
		);

		await apiKeyRepository.createWithScopes(
			apiKeyEntity,
			action.payload.scopes as ApiKeyScope[]
		);

		logger.info(
			{ apiKeyId: apiKeyEntity.id, workspaceId },
			'API key created successfully'
		);

		return {
			id: apiKeyEntity.id,
			key,
			keyPrefix: apiKeyEntity.keyPrefix,
			name: apiKeyEntity.name,
			scopes: action.payload.scopes as ApiKeyScope[],
			createdAt: apiKeyEntity.createdAt,
			lastUsedAt: apiKeyEntity.lastUsedAt,
			expiresAt: apiKeyEntity.expiresAt,
			revokedAt: apiKeyEntity.revokedAt,
		};
	};

	const init = async () => {
		commandBus.register(createApiKeyAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
