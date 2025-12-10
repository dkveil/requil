import type { ApiKey, ApiKeyScope as DBApiKeyScope } from '@requil/db';

export type ApiKeyId = ApiKey['id'];
export type WorkspaceId = ApiKey['workspaceId'];
export type UserId = string;

export type ApiKeyScope = DBApiKeyScope;
export type ApiKeyProps = ApiKey;

export type CreateApiKeyProps = {
	name: string;
	scopes: ApiKeyScope[];
	expiresAt?: Date;
};

export type ApiKeyWithScopes = ApiKey & {
	scopes: ApiKeyScope[];
};

export type ApiKeyResponse = {
	id: string;
	keyPrefix: string;
	name: string;
	scopes: ApiKeyScope[];
	createdAt: string;
	lastUsedAt: string | null;
	expiresAt: string | null;
	revokedAt: string | null;
};

export type ApiKeyCreatedResponse = ApiKeyResponse & {
	key: string;
};
