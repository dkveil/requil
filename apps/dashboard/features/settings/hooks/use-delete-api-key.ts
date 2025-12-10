import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/error';
import { apiKeysApi } from '../api/api-keys-api';

type DeleteApiKeyParams = {
	workspaceId: string;
	keyId: string;
};

export function useDeleteApiKey() {
	const queryClient = useQueryClient();

	return useMutation<void, ApiClientError, DeleteApiKeyParams>({
		mutationFn: async ({ workspaceId, keyId }) => {
			await apiKeysApi.revoke(workspaceId, keyId);
		},
		onSuccess: (_, { workspaceId }) => {
			queryClient.invalidateQueries({ queryKey: ['api-keys', workspaceId] });
		},
	});
}
