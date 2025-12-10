import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/features/workspace';

type TransportType = 'resend' | 'smtp';
type TransportState = 'active' | 'inactive' | 'unverified';

export type TransportConfig = {
	id: string;
	workspaceId: string;
	type: TransportType;
	state: TransportState;
	fromDomain?: string;
	fromEmail?: string;
	smtpHost?: string;
	smtpPort?: number;
	smtpSecure?: boolean;
	smtpUser?: string;
	updatedAt: string;
};

export function useTransportConfig() {
	const { currentWorkspace } = useWorkspace();

	return useQuery<TransportConfig | null>({
		queryKey: ['transport-config', currentWorkspace?.id],
		queryFn: async () => {
			if (!currentWorkspace?.id) return null;

			return null;
		},
		enabled: !!currentWorkspace?.id,
	});
}
