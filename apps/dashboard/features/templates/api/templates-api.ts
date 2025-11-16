import type {
	CreateTemplateInput,
	CreateTemplateResponse,
	FindWorkspaceTemplatesResponse,
	TemplateResponse,
	UpdateTemplateInput,
	UpdateTemplateResponse,
} from '@requil/types/templates';
import { API_ROUTES } from '@requil/utils/api-routes';
import { fetchAPI } from '@/lib/api/client';

export const templatesApi = {
	async create(data: CreateTemplateInput): Promise<CreateTemplateResponse> {
		const response = await fetchAPI<CreateTemplateResponse>(
			API_ROUTES.TEMPLATE.CREATE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
		return response.data;
	},

	async findByWorkspace(
		workspaceId: string
	): Promise<FindWorkspaceTemplatesResponse> {
		const response = await fetchAPI<FindWorkspaceTemplatesResponse>(
			`${API_ROUTES.TEMPLATE.LIST}?workspaceId=${workspaceId}`,
			{
				method: 'GET',
			}
		);
		return response.data;
	},

	async getById(id: string): Promise<TemplateResponse> {
		const response = await fetchAPI<TemplateResponse>(
			`${API_ROUTES.TEMPLATE.GET.replace(':id', id)}?id=${id}`,
			{
				method: 'GET',
			}
		);
		return response.data;
	},

	async update(
		id: string,
		data: UpdateTemplateInput
	): Promise<UpdateTemplateResponse> {
		const response = await fetchAPI<UpdateTemplateResponse>(
			API_ROUTES.TEMPLATE.UPDATE.replace(':id', id),
			{
				method: 'PATCH',
				body: JSON.stringify(data),
			}
		);
		return response.data;
	},

	async delete(id: string): Promise<void> {
		await fetchAPI(API_ROUTES.TEMPLATE.DELETE.replace(':id', id), {
			method: 'DELETE',
		});
	},
};
