'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/api';
import { useAuth } from '../hooks/use-auth';

export function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { signIn } = useAuth();
	const router = useRouter();
	const tAuth = useTranslations('auth.login');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			await signIn(email, password);
			router.push('/');
			router.refresh();
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center'>
					<h1 className='text-3xl font-bold tracking-tight text-gray-900'>
						{tAuth('title')}
					</h1>
					<p className='mt-2 text-sm text-gray-600'>
						{tAuth('noAccount')}{' '}
						<Link
							href='/auth/register'
							className='font-medium text-gray-900 hover:text-gray-700'
						>
							{tAuth('signUpLink')}
						</Link>
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className='mt-8 space-y-6'
				>
					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className='space-y-4'>
						<div>
							<Label htmlFor='email'>{tAuth('email')}</Label>
							<Input
								id='email'
								type='email'
								placeholder={tAuth('emailPlaceholder')}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
								className='mt-1'
							/>
						</div>

						<div>
							<Label htmlFor='password'>{tAuth('password')}</Label>
							<Input
								id='password'
								type='password'
								placeholder={tAuth('passwordPlaceholder')}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading}
								className='mt-1'
							/>
						</div>
					</div>

					<Button
						type='submit'
						className='w-full'
						disabled={loading}
					>
						{loading ? tAuth('loading') : tAuth('submit')}
					</Button>
				</form>
			</div>
		</div>
	);
}
