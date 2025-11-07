'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useWorkspace } from '@/features/workspace';

export default function DashboardPage() {
	const t = useTranslations('common');
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);
	const router = useRouter();

	const {
		recommendedWorkspace,
		loading: workspaceLoading,
		initialized: workspaceInitialized,
		loadWorkspaces,
	} = useWorkspace();

	useEffect(() => {
		if (user && !workspaceInitialized) {
			loadWorkspaces();
		}
	}, [user, workspaceInitialized, loadWorkspaces]);

	useEffect(() => {
		if (!workspaceInitialized) return;

		if (recommendedWorkspace) {
			router.replace(`/workspace/${recommendedWorkspace.slug}`);
		} else {
			router.replace('/welcome');
		}
	}, [workspaceInitialized, recommendedWorkspace, router]);

	if (authLoading || workspaceLoading || !workspaceInitialized) {
		return <LoadingScreen text={t('loading')} />;
	}

	return <LoadingScreen text={t('redirecting')} />;
}
