'use client';

import { type ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useWorkspace } from '../hooks/use-workspace';

type Props = {
	children: ReactNode;
};

export function WorkspaceProvider({ children }: Props) {
	const user = useAuthStore((state) => state.user);
	const { initialized, loadWorkspaces } = useWorkspace();

	useEffect(() => {
		if (user && !initialized) {
			loadWorkspaces();
		}
	}, [user, initialized, loadWorkspaces]);

	return <>{children}</>;
}
