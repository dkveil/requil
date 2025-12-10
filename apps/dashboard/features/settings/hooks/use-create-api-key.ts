import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/error';

type CreateApiKeyInput = {
	name: string;
};

type CreateApiKeyResponse = {
	id: string;
	name: string;
	key: string;
	prefix: string;
	createdAt: string;
};

type CreateApiKeyParams = {
	workspaceId: string;
	data: CreateApiKeyInput;
};

export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation<CreateApiKeyResponse, ApiClientError, CreateApiKeyParams>({
		mutationFn: async ({ workspaceId, data }) => {
			throw new Error('API endpoint not implemented yet');
		},
		onSuccess: (_, { workspaceId }) => {
			queryClient.invalidateQueries({ queryKey: ['api-keys', workspaceId] });
		},
	});
}
