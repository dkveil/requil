'use client';

import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { getErrorMessage } from '@/lib/api';

export default function OAuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const locale = useLocale();
	const handleOAuthCallback = useAuthStore(
		(state) => state.handleOAuthCallback
	);
	const [error, setError] = useState<string | null>(null);
	const tAuth = useTranslations('auth.login');

	// biome-ignore lint/correctness/useExhaustiveDependencies: just i need to use it once
	useEffect(() => {
		const handleCallback = async (code: string) => {
			try {
				await handleOAuthCallback(code);

				toast.success('Login Successful', {
					description: 'You have been successfully logged in',
				});

				router.push(DASHBOARD_ROUTES.HOME);
				router.refresh();
			} catch (err) {
				const message = getErrorMessage(err, locale);
				setError(message);

				toast.error('Login Failed', {
					description: message,
				});

				setTimeout(() => {
					router.push(DASHBOARD_ROUTES.AUTH.LOGIN);
				}, 3000);
			}
		};

		const code = searchParams.get('code');
		const errorParam = searchParams.get('error');
		const errorDescription = searchParams.get('error_description');

		if (errorParam) {
			const message = errorDescription || 'OAuth authorization failed';
			setError(message);
			toast.error(tAuth('authorizationFailed'), {
				description: message,
			});

			setTimeout(() => {
				router.push(DASHBOARD_ROUTES.AUTH.LOGIN);
			}, 3000);
			return;
		}

		if (!code) {
			setError('No authorization code received');
			toast.error('Authorization Failed', {
				description: 'No authorization code received',
			});

			setTimeout(() => {
				router.push(DASHBOARD_ROUTES.AUTH.LOGIN);
			}, 3000);
			return;
		}

		handleCallback(code);
	}, []);

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='text-center'>
				{!error ? (
					<>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4' />
						<h2 className='text-xl font-semibold'>
							{tAuth('processingAuthorization')}
						</h2>
						<p className='text-muted-foreground mt-2'>{tAuth('pleaseWait')}</p>
					</>
				) : (
					<>
						<h2 className='text-xl font-semibold text-destructive'>
							{tAuth('authorizationFailed')}
						</h2>
						<p className='text-muted-foreground mt-2'>{error}</p>
						<p className='text-sm text-muted-foreground mt-4'>
							{tAuth('authorizationFailedRedirecting')}
						</p>
					</>
				)}
			</div>
		</div>
	);
}
