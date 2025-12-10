import type {
	UpdateWorkspaceInput,
	UpdateWorkspaceResponse,
} from '@requil/types/workspace';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '@/features/workspace/api/workspace-api';
import { ApiClientError } from '@/lib/api/error';

type UpdateWorkspaceParams = {
	workspaceId: string;
	data: UpdateWorkspaceInput;
};

export function useUpdateWorkspace() {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateWorkspaceResponse,
		ApiClientError,
		UpdateWorkspaceParams
	>({
		mutationFn: async ({ workspaceId, data }) => {
			return workspaceApi.update(workspaceId, data);
		},
		onSuccess: (updatedWorkspace) => {
			queryClient.invalidateQueries({ queryKey: ['workspaces'] });
			queryClient.invalidateQueries({
				queryKey: ['workspace', updatedWorkspace.id],
			});
		},
	});
}
