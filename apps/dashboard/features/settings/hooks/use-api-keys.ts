import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/features/workspace';

export type ApiKey = {
	id: string;
	name: string;
	prefix: string;
	createdAt: string;
	lastUsedAt: string | null;
};

export function useApiKeys() {
	const { currentWorkspace } = useWorkspace();

	return useQuery<ApiKey[]>({
		queryKey: ['api-keys', currentWorkspace?.id],
		queryFn: async () => {
			if (!currentWorkspace?.id) return [];

			return [];
		},
		enabled: !!currentWorkspace?.id,
	});
}
