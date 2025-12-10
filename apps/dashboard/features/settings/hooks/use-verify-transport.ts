import { useMutation } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/error';

type VerifyTransportParams = {
	workspaceId: string;
};

type VerifyTransportResponse = {
	success: boolean;
	message?: string;
};

export function useVerifyTransport() {
	return useMutation<
		VerifyTransportResponse,
		ApiClientError,
		VerifyTransportParams
	>({
		mutationFn: async ({ workspaceId }) => {
			throw new Error('API endpoint not implemented yet');
		},
	});
}
