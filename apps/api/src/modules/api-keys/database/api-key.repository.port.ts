import type { RepositoryPort } from '@/shared/db/repository.port';
import type { ApiKeyEntity } from '../domain/api-key.domain';
import type {
	ApiKeyId,
	ApiKeyResponse,
	ApiKeyScope,
	ApiKeyWithScopes,
	WorkspaceId,
} from '../domain/api-key.types';

export interface IApiKeyRepository
	extends RepositoryPort<ApiKeyEntity, ApiKeyId> {
	createWithScopes(
		entity: ApiKeyEntity,
		scopes: ApiKeyScope[]
	): Promise<ApiKeyEntity>;

	findByIdWithScopes(
		id: ApiKeyId,
		workspaceId: WorkspaceId
	): Promise<ApiKeyWithScopes | undefined>;

	findByWorkspace(
		workspaceId: WorkspaceId,
		includeRevoked: boolean,
		page: number,
		limit: number
	): Promise<{
		data: ApiKeyResponse[];
		total: number;
	}>;

	findByPrefix(prefix: string): Promise<ApiKeyWithScopes | undefined>;

	revoke(id: ApiKeyId, workspaceId: WorkspaceId): Promise<void>;

	updateLastUsedAt(id: ApiKeyId): Promise<void>;
}
