'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useWelcomeStore } from '../stores/welcome-store';

export function PricingStep() {
	const t = useTranslations('welcome.pricing');
	const { selectPlan, setStep } = useWelcomeStore();

	const handleSelectPlan = () => {
		selectPlan('free');
		setStep('workspace');
	};

	return (
		<div className='space-y-6'>
			<div className='text-center space-y-2'>
				<h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
				<p className='text-muted-foreground'>{t('description')}</p>
			</div>

			<div className='flex justify-center'>
				<Card className='w-full max-w-md border-2 border-primary'>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-2xl'>{t('free.name')}</CardTitle>
							<Badge variant='secondary'>{t('free.badge')}</Badge>
						</div>
						<CardDescription>{t('free.description')}</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='bg-muted/50 p-4 rounded-lg'>
							<p className='text-sm text-muted-foreground'>
								{t('free.notice')}
							</p>
						</div>

						<div className='space-y-3'>
							<div className='flex items-start gap-3'>
								<Check className='size-5 text-primary shrink-0 mt-0.5' />
								<span className='text-sm'>
									{t('free.features.emails', { count: '500' })}
								</span>
							</div>
							<div className='flex items-start gap-3'>
								<Check className='size-5 text-primary shrink-0 mt-0.5' />
								<span className='text-sm'>
									{t('free.features.workspaces', { count: '1' })}
								</span>
							</div>
							<div className='flex items-start gap-3'>
								<Check className='size-5 text-primary shrink-0 mt-0.5' />
								<span className='text-sm'>
									{t('free.features.templates', { count: '5' })}
								</span>
							</div>
							<div className='flex items-start gap-3'>
								<Check className='size-5 text-primary shrink-0 mt-0.5' />
								<span className='text-sm'>
									{t('free.features.apiCalls', { count: '1,000' })}
								</span>
							</div>
							<div className='flex items-start gap-3'>
								<Check className='size-5 text-primary shrink-0 mt-0.5' />
								<span className='text-sm'>{t('free.features.support')}</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={handleSelectPlan}
							className='w-full'
							size='lg'
						>
							{t('selectPlan')}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
