import type {
	AssetType,
	DeleteAssetResponse,
	FindAssetsResponse,
	UploadAssetResponse,
} from '@requil/types';
import { API_ROUTES } from '@requil/utils/api-routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function uploadAsset(
	workspaceId: string,
	file: File,
	type: AssetType,
	alt?: string
): Promise<UploadAssetResponse> {
	try {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('workspaceId', workspaceId);
		formData.append('type', type);
		if (alt) {
			formData.append('alt', alt);
		}

		const url = API_ROUTES.ASSET.UPLOAD.replace(':workspaceId', workspaceId);

		const response = await fetch(`${API_URL}${url}`, {
			method: 'POST',
			credentials: 'include',
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || 'Failed to upload asset');
		}

		const data = await response.json();
		return data.data;
	} catch (error: any) {
		const message = error?.message || 'Failed to upload asset';
		throw new Error(message);
	}
}

export async function findAssets(
	workspaceId: string,
	options?: {
		type?: AssetType;
		search?: string;
		page?: number;
		limit?: number;
	}
): Promise<FindAssetsResponse> {
	try {
		const params = new URLSearchParams();
		if (options?.type) params.append('type', options.type);
		if (options?.search) params.append('search', options.search);
		if (options?.page) params.append('page', options.page.toString());
		if (options?.limit) params.append('limit', options.limit.toString());

		const url = API_ROUTES.ASSET.FIND.replace(':workspaceId', workspaceId);
		const queryString = params.toString();

		const response = await fetch(
			`${API_URL}${url}${queryString ? `?${queryString}` : ''}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || 'Failed to fetch assets');
		}

		const data = await response.json();
		return data.data;
	} catch (error: any) {
		const message = error?.message || 'Failed to fetch assets';
		throw new Error(message);
	}
}

export async function deleteAsset(
	workspaceId: string,
	assetId: string
): Promise<DeleteAssetResponse> {
	try {
		const url = API_ROUTES.ASSET.DELETE.replace(
			':workspaceId',
			workspaceId
		).replace(':id', assetId);

		const response = await fetch(`${API_URL}${url}`, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || 'Failed to delete asset');
		}

		const data = await response.json();
		return data.data;
	} catch (error: any) {
		const message = error?.message || 'Failed to delete asset';
		throw new Error(message);
	}
}
