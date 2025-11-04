'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError, getErrorMessage } from '@/lib/api/error-handler';
import { useAuth } from '@/lib/auth/auth-context';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);
	const { signUp } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (password !== confirmPassword) {
			setError('Hasła nie są identyczne');
			return;
		}

		if (password.length < 8) {
			setError('Hasło musi mieć minimum 8 znaków');
			return;
		}

		setLoading(true);

		try {
			await signUp(email, password);
			setSuccess(
				'Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę email.'
			);
			setTimeout(() => {
				router.push('/auth/login');
			}, 2000);
		} catch (err) {
			setError(getErrorMessage(err));

			if (err instanceof ApiClientError && err.code === 'USER_ALREADY_EXISTS') {
				setTimeout(() => {
					router.push('/auth/login');
				}, 3000);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center'>
					<h1 className='text-3xl font-bold tracking-tight text-gray-900'>
						Stwórz konto
					</h1>
					<p className='mt-2 text-sm text-gray-600'>
						Masz już konto?{' '}
						<Link
							href='/auth/login'
							className='font-medium text-gray-900 hover:text-gray-700'
						>
							Zaloguj się
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

					{success && (
						<Alert variant='success'>
							<AlertDescription>{success}</AlertDescription>
						</Alert>
					)}

					<div className='space-y-4'>
						<div>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='twoj@email.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
								className='mt-1'
							/>
						</div>

						<div>
							<Label htmlFor='password'>Hasło</Label>
							<Input
								id='password'
								type='password'
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading}
								minLength={8}
								className='mt-1'
							/>
							<p className='mt-1 text-sm text-gray-500'>Minimum 8 znaków</p>
						</div>

						<div>
							<Label htmlFor='confirmPassword'>Potwierdź hasło</Label>
							<Input
								id='confirmPassword'
								type='password'
								placeholder='••••••••'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={loading}
								minLength={8}
								className='mt-1'
							/>
						</div>
					</div>

					<Button
						type='submit'
						className='w-full'
						disabled={loading}
					>
						{loading ? 'Rejestracja...' : 'Zarejestruj się'}
					</Button>
				</form>
			</div>
		</div>
	);
}
