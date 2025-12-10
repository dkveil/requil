import type {
	CreateWorkspaceInput,
	CreateWorkspaceResponse,
	FindUserWorkspacesResponse,
	UpdateWorkspaceInput,
	UpdateWorkspaceResponse,
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

	async update(
		workspaceId: string,
		data: UpdateWorkspaceInput
	): Promise<UpdateWorkspaceResponse> {
		const url = API_ROUTES.WORKSPACE.UPDATE.replace(':id', workspaceId);
		const response = await fetchAPI<UpdateWorkspaceResponse>(url, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
		return response.data;
	},
};
