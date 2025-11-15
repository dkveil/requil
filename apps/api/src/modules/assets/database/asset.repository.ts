import { type Asset, assets, type NewAsset } from '@requil/db';
import { and, count, eq, ilike, or, sql } from 'drizzle-orm';
import type { IAssetRepository } from './asset.repository.port';

type AssetType = 'image' | 'font';

export default function assetRepository({
	db,
	logger,
}: Dependencies): IAssetRepository {
	const create = async (asset: NewAsset): Promise<Asset> => {
		const [result] = await db.insert(assets).values(asset).returning();

		if (!result) {
			throw new Error('Failed to create asset');
		}

		return result;
	};

	const findById = async (id: string): Promise<Asset | null> => {
		const [result] = await db
			.select()
			.from(assets)
			.where(eq(assets.id, id))
			.limit(1);

		return result || null;
	};

	const findByWorkspaceId = async (
		workspaceId: string,
		options?: {
			type?: AssetType;
			search?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<{ data: Asset[]; total: number }> => {
		const conditions = [eq(assets.workspaceId, workspaceId)];

		if (options?.type) {
			conditions.push(eq(assets.type, options.type));
		}

		if (options?.search) {
			conditions.push(
				or(
					ilike(assets.originalFilename, `%${options.search}%`),
					ilike(assets.filename, `%${options.search}%`),
					ilike(assets.alt ?? '', `%${options.search}%`)
				) as any
			);
		}

		const whereClause = and(...conditions);

		const [totalResult] = await db
			.select({ count: count() })
			.from(assets)
			.where(whereClause);

		const data = await db
			.select()
			.from(assets)
			.where(whereClause)
			.orderBy(sql`${assets.createdAt} DESC`)
			.limit(options?.limit ?? 50)
			.offset(options?.offset ?? 0);

		return {
			data,
			total: totalResult?.count ?? 0,
		};
	};

	const updateStatus = async (
		id: string,
		status: 'uploading' | 'ready' | 'error',
		publicUrl?: string
	): Promise<Asset> => {
		const updateData: Partial<NewAsset> = {
			status,
			updatedAt: new Date().toISOString(),
		};

		if (publicUrl) {
			updateData.publicUrl = publicUrl;
		}

		const [result] = await db
			.update(assets)
			.set(updateData)
			.where(eq(assets.id, id))
			.returning();

		if (!result) {
			throw new Error('Failed to update asset status');
		}

		return result;
	};

	const updateMetadata = async (
		id: string,
		metadata: {
			width?: number;
			height?: number;
			alt?: string;
		}
	): Promise<Asset> => {
		const [result] = await db
			.update(assets)
			.set({
				...metadata,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(assets.id, id))
			.returning();

		if (!result) {
			throw new Error('Failed to update asset metadata');
		}

		return result;
	};

	const deleteAsset = async (id: string): Promise<void> => {
		await db.delete(assets).where(eq(assets.id, id));
	};

	const existsById = async (id: string): Promise<boolean> => {
		const result = await db
			.select({ exists: sql<boolean>`1` })
			.from(assets)
			.where(eq(assets.id, id))
			.limit(1);

		return result.length > 0;
	};

	return {
		create,
		findById,
		findByWorkspaceId,
		updateStatus,
		updateMetadata,
		delete: deleteAsset,
		existsById,
	};
}
