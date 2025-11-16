'use client';

import { KeyRound, Mail, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const BETA_ACCESS_CODE = 'REQUIL_BETA_2025_XK9P7M';

export function AccessForm() {
	const t = useTranslations('access');
	const [code, setCode] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (code.trim().toUpperCase() === BETA_ACCESS_CODE) {
				const response = await fetch('/api/access/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ code: code.trim().toUpperCase() }),
				});

				if (response.ok) {
					toast.success(t('success'));
					window.location.href = '/';
				} else {
					toast.error(t('invalidCode'));
				}
			} else {
				toast.error(t('invalidCode'));
			}
		} catch {
			toast.error(t('error'));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center space-y-3'>
					<div className='flex justify-center'>
						<div className='relative'>
							<div className='absolute inset-0 bg-primary/20 blur-3xl rounded-full' />
							<div className='relative bg-primary/10 p-4 rounded-2xl border border-primary/20'>
								<Sparkles className='h-12 w-12 text-primary' />
							</div>
						</div>
					</div>
					<h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground max-w-sm mx-auto'>
						{t('description')}
					</p>
				</div>

				<Card className='border-2'>
					<CardHeader className='space-y-1 pb-4'>
						<div className='flex items-center gap-2 text-sm font-medium'>
							<KeyRound className='h-4 w-4 text-primary' />
							<span>{t('enterCode')}</span>
						</div>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit}
							className='space-y-4'
						>
							<div className='space-y-2'>
								<Input
									type='text'
									placeholder={t('codePlaceholder')}
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className='text-center text-lg font-mono tracking-wider uppercase'
									disabled={isLoading}
									autoFocus
									required
								/>
							</div>
							<Button
								type='submit'
								className='w-full'
								disabled={isLoading || !code.trim()}
								size='lg'
							>
								{isLoading ? t('verifying') : t('submit')}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card className='border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'>
					<CardContent className='pt-6'>
						<div className='flex gap-3'>
							<Mail className='h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5' />
							<div className='space-y-1'>
								<p className='text-sm font-medium text-amber-900 dark:text-amber-100'>
									{t('needAccess')}
								</p>
								<p className='text-sm text-amber-800 dark:text-amber-200'>
									{t('contactUs')}{' '}
									<a
										href='mailto:contact@reveil.dev'
										className='font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 transition-colors'
									>
										contact@reveil.dev
									</a>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<p className='text-center text-xs text-muted-foreground'>
					{t('footer')}
				</p>
			</div>
		</div>
	);
}
