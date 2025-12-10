import type {
	CreateApiKeyResponse,
	ListApiKeysResponse,
} from '@requil/types/api-keys';
import { API_ROUTES } from '@requil/utils/api-routes';
import { fetchAPI } from '@/lib/api/client';

export type CreateApiKeyInput = {
	name: string;
	scopes: string[];
	expiresAt?: string;
};

export type ListApiKeysParams = {
	page?: number;
	limit?: number;
	includeRevoked?: boolean;
};

export const apiKeysApi = {
	async list(
		workspaceId: string,
		params?: ListApiKeysParams
	): Promise<ListApiKeysResponse> {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.set('page', params.page.toString());
		if (params?.limit) searchParams.set('limit', params.limit.toString());
		if (params?.includeRevoked) {
			searchParams.set('includeRevoked', params.includeRevoked.toString());
		}

		const queryString = searchParams.toString();
		const url = queryString
			? `${API_ROUTES.API_KEY.LIST}?${queryString}`
			: API_ROUTES.API_KEY.LIST;

		const response = await fetchAPI<ListApiKeysResponse>(url, {
			method: 'GET',
			headers: {
				'x-workspace-id': workspaceId,
			},
		});
		return response.data;
	},

	async create(
		workspaceId: string,
		data: CreateApiKeyInput
	): Promise<CreateApiKeyResponse> {
		const response = await fetchAPI<CreateApiKeyResponse>(
			API_ROUTES.API_KEY.CREATE,
			{
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'x-workspace-id': workspaceId,
				},
			}
		);
		return response.data;
	},

	async revoke(workspaceId: string, keyId: string): Promise<void> {
		await fetchAPI(API_ROUTES.API_KEY.REVOKE.replace(':keyId', keyId), {
			method: 'DELETE',
			headers: {
				'x-workspace-id': workspaceId,
			},
		});
	},
};
