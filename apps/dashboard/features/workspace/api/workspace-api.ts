import type {
	CreateWorkspaceInput,
	CreateWorkspaceResponse,
	FindUserWorkspacesResponse,
} from '@requil/types/workspace';
import { API_ROUTES } from '@requil/utils/api-routes';
import { fetchAPI } from '@/lib/api/client';

export const workspaceApi = {
	async getUserWorkspaces(): Promise<FindUserWorkspacesResponse> {
		const response = await fetchAPI<FindUserWorkspacesResponse>(
			API_ROUTES.WORKSPACE.LIST,
			{
				method: 'GET',
			}
		);
		return response.data;
	},

	async create(data: CreateWorkspaceInput): Promise<CreateWorkspaceResponse> {
		const response = await fetchAPI<CreateWorkspaceResponse>(
			API_ROUTES.WORKSPACE.CREATE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
		return response.data;
	},
};
