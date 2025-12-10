import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/error';
import type { TransportConfig } from './use-transport-config';

type UpdateTransportInput = {
	type: 'resend' | 'smtp';
	fromDomain?: string;
	fromEmail?: string;
	apiKey?: string;
	smtpHost?: string;
	smtpPort?: number;
	smtpSecure?: boolean;
	smtpUser?: string;
	smtpPassword?: string;
};

type UpdateTransportParams = {
	workspaceId: string;
	data: UpdateTransportInput;
};

export function useUpdateTransport() {
	const queryClient = useQueryClient();

	return useMutation<TransportConfig, ApiClientError, UpdateTransportParams>({
		mutationFn: async ({ workspaceId, data }) => {
			throw new Error('API endpoint not implemented yet');
		},
		onSuccess: (updatedConfig) => {
			queryClient.invalidateQueries({
				queryKey: ['transport-config', updatedConfig.workspaceId],
			});
		},
	});
}
