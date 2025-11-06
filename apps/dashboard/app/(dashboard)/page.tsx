'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useWorkspaceStore } from '@/features/workspace';

export default function DashboardPage() {
	const t = useTranslations('common');
	const user = useAuthStore((state) => state.user);
	const signOut = useAuthStore((state) => state.signOut);
	const authLoading = useAuthStore((state) => state.loading);
	const router = useRouter();

	const {
		workspaces,
		loading: workspaceLoading,
		initialized: workspaceInitialized,
		loadWorkspaces,
	} = useWorkspaceStore();

	useEffect(() => {
		if (user && !workspaceInitialized) {
			loadWorkspaces();
		}
	}, [user, workspaceInitialized, loadWorkspaces]);

	useEffect(() => {
		if (workspaceInitialized && workspaces.length === 0) {
			router.push('/welcome');
		}
	}, [workspaceInitialized, workspaces, router]);

	const handleSignOut = async () => {
		try {
			await signOut();
			router.push('/auth/login');
		} catch {
			router.push('/auth/login');
		}
	};

	if (authLoading || workspaceLoading || !workspaceInitialized) {
		return <LoadingScreen text={t('loading')} />;
	}

	if (workspaces.length === 0) {
		return <LoadingScreen text={t('redirecting')} />;
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<header className='border-b border-gray-200 bg-white'>
				<div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4'>
					<h1 className='text-xl font-semibold text-gray-900'>
						Requil Dashboard
					</h1>
					<div className='flex items-center gap-4'>
						<p className='text-sm text-gray-600'>{user?.email}</p>
						<Button
							variant='outline'
							onClick={handleSignOut}
						>
							Wyloguj się
						</Button>
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 py-8'>
				<div className='rounded-lg bg-white p-8 shadow'>
					<h2 className='text-2xl font-bold text-gray-900'>Witaj w Requil!</h2>
					<p className='mt-2 text-gray-600'>
						Dashboard jest w trakcie budowy. Wkrótce dostępne będą funkcje
						zarządzania szablonami, kampaniami i więcej.
					</p>

					<div className='mt-8 grid gap-4 md:grid-cols-3'>
						<div className='rounded-lg border border-gray-200 p-6'>
							<h3 className='font-semibold text-gray-900'>Szablony</h3>
							<p className='mt-2 text-sm text-gray-600'>
								Zarządzaj szablonami email
							</p>
						</div>
						<div className='rounded-lg border border-gray-200 p-6'>
							<h3 className='font-semibold text-gray-900'>Kampanie</h3>
							<p className='mt-2 text-sm text-gray-600'>
								Wysyłaj kampanie email
							</p>
						</div>
						<div className='rounded-lg border border-gray-200 p-6'>
							<h3 className='font-semibold text-gray-900'>Analityka</h3>
							<p className='mt-2 text-sm text-gray-600'>Śledź wyniki wysyłek</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
