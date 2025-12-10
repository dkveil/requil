import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/features/workspace';
import { apiKeysApi } from '../api/api-keys-api';

export type ApiKey = {
	id: string;
	name: string;
	keyPrefix: string;
	scopes: string[];
	createdAt: string;
	lastUsedAt: string | null;
	expiresAt: string | null;
	revokedAt: string | null;
};

type UseApiKeysParams = {
	page?: number;
	limit?: number;
	includeRevoked?: boolean;
};

export function useApiKeys(params?: UseApiKeysParams) {
	const { currentWorkspace } = useWorkspace();

	return useQuery({
		queryKey: ['api-keys', currentWorkspace?.id, params],
		queryFn: async () => {
			if (!currentWorkspace?.id) {
				throw new Error('No workspace selected');
			}

			const response = await apiKeysApi.list(currentWorkspace.id, params);
			return response.data;
		},
		enabled: !!currentWorkspace?.id,
	});
}
