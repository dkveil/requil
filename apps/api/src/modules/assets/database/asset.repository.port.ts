import type { Asset, NewAsset } from '@requil/db';

type AssetType = 'image' | 'font';

export interface IAssetRepository {
	create(asset: NewAsset): Promise<Asset>;
	findById(id: string): Promise<Asset | null>;
	findByWorkspaceId(
		workspaceId: string,
		options?: {
			type?: AssetType;
			search?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<{ data: Asset[]; total: number }>;
	updateStatus(
		id: string,
		status: 'uploading' | 'ready' | 'error',
		publicUrl?: string
	): Promise<Asset>;
	updateMetadata(
		id: string,
		metadata: {
			width?: number;
			height?: number;
			alt?: string;
		}
	): Promise<Asset>;
	delete(id: string): Promise<void>;
	existsById(id: string): Promise<boolean>;
}
