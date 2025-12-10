import type { CreateApiKeyResponse } from '@requil/types/api-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/error';
import { apiKeysApi } from '../api/api-keys-api';

type CreateApiKeyFormData = {
	name: string;
};

type CreateApiKeyParams = {
	workspaceId: string;
	data: CreateApiKeyFormData;
};

export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation<CreateApiKeyResponse, ApiClientError, CreateApiKeyParams>({
		mutationFn: async ({ workspaceId, data }) => {
			return await apiKeysApi.create(workspaceId, {
				name: data.name,
				scopes: ['send', 'templates:read', 'templates:write'],
				expiresAt: undefined,
			});
		},
		onSuccess: (_, { workspaceId }) => {
			queryClient.invalidateQueries({ queryKey: ['api-keys', workspaceId] });
		},
	});
}
