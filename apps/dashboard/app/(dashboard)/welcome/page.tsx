'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { WelcomeContainer } from '@/features/welcome';
import { useWorkspaceStore } from '@/features/workspace';

export default function WelcomePage() {
	const t = useTranslations('common');
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const { workspaces, loading, initialized, loadWorkspaces } =
		useWorkspaceStore();

	useEffect(() => {
		if (user && !initialized) {
			loadWorkspaces();
		}
	}, [user, initialized, loadWorkspaces]);

	useEffect(() => {
		if (initialized && workspaces.length > 0) {
			router.push('/');
		}
	}, [initialized, workspaces, router]);

	if (loading || !initialized) {
		return <LoadingScreen text={t('loading')} />;
	}

	if (workspaces.length > 0) {
		return <LoadingScreen text={t('redirecting')} />;
	}

	return <WelcomeContainer />;
}
