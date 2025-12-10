import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/error';

type DeleteApiKeyParams = {
	workspaceId: string;
	keyId: string;
};

export function useDeleteApiKey() {
	const queryClient = useQueryClient();

	return useMutation<void, ApiClientError, DeleteApiKeyParams>({
		mutationFn: async ({ workspaceId, keyId }) => {
			throw new Error('API endpoint not implemented yet');
		},
		onSuccess: (_, { workspaceId }) => {
			queryClient.invalidateQueries({ queryKey: ['api-keys', workspaceId] });
		},
	});
}
