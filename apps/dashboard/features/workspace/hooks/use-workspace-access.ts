import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWorkspace } from './use-workspace';

export function useWorkspaceAccess(workspaceSlug: string) {
	const [accessChecked, setAccessChecked] = useState(false);
	const router = useRouter();
	const { initialized, hasAccessToWorkspaceBySlug, setCurrentWorkspaceBySlug } =
		useWorkspace();

	// biome-ignore lint/correctness/useExhaustiveDependencies: just i need to use it once
	useEffect(() => {
		if (!initialized) return;

		if (!hasAccessToWorkspaceBySlug(workspaceSlug)) {
			router.replace(DASHBOARD_ROUTES.WELCOME);
			return;
		}

		setCurrentWorkspaceBySlug(workspaceSlug);
		setAccessChecked(true);
	}, [initialized, workspaceSlug]);

	return { accessChecked };
}
