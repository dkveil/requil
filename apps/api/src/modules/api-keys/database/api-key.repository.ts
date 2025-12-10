import {
	type ApiKey,
	apiKeyScopes,
	apiKeys,
	type ApiKeyScope as DBApiKeyScope,
} from '@requil/db';
import { and, count, eq, isNull } from 'drizzle-orm';
import { ApiKeyEntity } from '../domain/api-key.domain';
import type {
	ApiKeyId,
	ApiKeyResponse,
	ApiKeyScope,
	ApiKeyWithScopes,
	WorkspaceId,
} from '../domain/api-key.types';
import type { IApiKeyRepository } from './api-key.repository.port';

export default function apiKeyRepository({
	db,
	logger,
	repositoryBase,
}: Dependencies): IApiKeyRepository {
	const baseRepository = repositoryBase<ApiKeyEntity, ApiKey>({
		table: apiKeys,
		mapper: {
			toPersistence: (entity: ApiKeyEntity) => entity.toPersistence(),
			toDomain: (model: ApiKey) => ApiKeyEntity.fromPersistence(model),
		},
	});

	const createWithScopes = async (
		entity: ApiKeyEntity,
		scopes: ApiKeyScope[]
	): Promise<ApiKeyEntity> => {
		const apiKeyData = entity.toPersistence();

		await db.transaction(async (tx) => {
			await tx.insert(apiKeys).values(apiKeyData);

			if (scopes.length > 0) {
				await tx.insert(apiKeyScopes).values(
					scopes.map((scope) => ({
						apiKeyId: entity.id,
						scope: scope as DBApiKeyScope,
					}))
				);
			}
		});

		logger.info(
			{ apiKeyId: entity.id, workspaceId: entity.workspaceId },
			'Created API key with scopes'
		);

		return entity;
	};

	const findByIdWithScopes = async (
		id: ApiKeyId,
		workspaceId: WorkspaceId
	): Promise<ApiKeyWithScopes | undefined> => {
		const result = await db
			.select({
				apiKey: apiKeys,
				scope: apiKeyScopes.scope,
			})
			.from(apiKeys)
			.leftJoin(apiKeyScopes, eq(apiKeys.id, apiKeyScopes.apiKeyId))
			.where(and(eq(apiKeys.id, id), eq(apiKeys.workspaceId, workspaceId)));

		if (result.length === 0) return undefined;

		const apiKey = result[0]?.apiKey;
		if (!apiKey) return undefined;

		const scopes = result
			.filter((r) => r.scope !== null)
			.map((r) => r.scope as ApiKeyScope);

		return {
			...apiKey,
			scopes,
		};
	};

	const findByWorkspace = async (
		workspaceId: WorkspaceId,
		includeRevoked: boolean,
		page: number,
		limit: number
	): Promise<{
		data: ApiKeyResponse[];
		total: number;
	}> => {
		const offset = (page - 1) * limit;

		const whereConditions = includeRevoked
			? eq(apiKeys.workspaceId, workspaceId)
			: and(eq(apiKeys.workspaceId, workspaceId), isNull(apiKeys.revokedAt));

		const [keysWithScopes, totalCount] = await Promise.all([
			db
				.select({
					apiKey: apiKeys,
					scope: apiKeyScopes.scope,
				})
				.from(apiKeys)
				.leftJoin(apiKeyScopes, eq(apiKeys.id, apiKeyScopes.apiKeyId))
				.where(whereConditions)
				.limit(limit)
				.offset(offset)
				.orderBy(apiKeys.createdAt),

			db
				.select({ count: count() })
				.from(apiKeys)
				.where(whereConditions)
				.then((result) => result[0]?.count ?? 0),
		]);

		const groupedKeys = new Map<string, ApiKeyResponse>();

		for (const row of keysWithScopes) {
			const key = row.apiKey;
			if (!groupedKeys.has(key.id)) {
				groupedKeys.set(key.id, {
					id: key.id,
					keyPrefix: key.keyPrefix,
					name: key.name,
					scopes: [],
					createdAt: key.createdAt,
					lastUsedAt: key.lastUsedAt,
					expiresAt: key.expiresAt,
					revokedAt: key.revokedAt,
				});
			}

			if (row.scope) {
				groupedKeys.get(key.id)?.scopes.push(row.scope as ApiKeyScope);
			}
		}

		return {
			data: Array.from(groupedKeys.values()),
			total: totalCount,
		};
	};

	const findByPrefix = async (
		prefix: string
	): Promise<ApiKeyWithScopes | undefined> => {
		const result = await db
			.select({
				apiKey: apiKeys,
				scope: apiKeyScopes.scope,
			})
			.from(apiKeys)
			.leftJoin(apiKeyScopes, eq(apiKeys.id, apiKeyScopes.apiKeyId))
			.where(eq(apiKeys.keyPrefix, prefix));

		if (result.length === 0) return undefined;

		const apiKey = result[0]?.apiKey;
		if (!apiKey) return undefined;

		const scopes = result
			.filter((r) => r.scope !== null)
			.map((r) => r.scope as ApiKeyScope);

		return {
			...apiKey,
			scopes,
		};
	};

	const revoke = async (
		id: ApiKeyId,
		workspaceId: WorkspaceId
	): Promise<void> => {
		const now = new Date().toISOString();

		const result = await db
			.update(apiKeys)
			.set({ revokedAt: now })
			.where(and(eq(apiKeys.id, id), eq(apiKeys.workspaceId, workspaceId)))
			.returning({ id: apiKeys.id });

		if (result.length === 0) {
			throw new Error('API key not found or already revoked');
		}

		logger.info({ apiKeyId: id, workspaceId }, 'Revoked API key');
	};

	const updateLastUsedAt = async (id: ApiKeyId): Promise<void> => {
		const now = new Date().toISOString();

		await db.update(apiKeys).set({ lastUsedAt: now }).where(eq(apiKeys.id, id));

		logger.debug({ apiKeyId: id }, 'Updated API key last used timestamp');
	};

	return {
		...baseRepository,
		createWithScopes,
		findByIdWithScopes,
		findByWorkspace,
		findByPrefix,
		revoke,
		updateLastUsedAt,
	};
}
