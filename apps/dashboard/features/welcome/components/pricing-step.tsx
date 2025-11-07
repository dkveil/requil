'use client';

import type { PlanName } from '@requil/types';
import { ACCOUNT_PLAN_LIMITS } from '@requil/types';
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
import { cn } from '@/lib/utils';
import { useWelcomeStore } from '../stores/welcome-store';

export function PricingStep() {
	const t = useTranslations('welcome.pricing');
	const { selectPlan, setStep } = useWelcomeStore();

	const handleSelectPlan = (plan: PlanName) => {
		selectPlan(plan);
		setStep('workspace');
	};

	return (
		<div className='space-y-6'>
			<div className='text-center space-y-2'>
				<h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
				<p className='text-muted-foreground'>{t('description')}</p>
			</div>

			<div className='flex justify-center'>
				{Object.entries(ACCOUNT_PLAN_LIMITS).map(([plan, limits]) => (
					<Card
						key={plan}
						className='w-full max-w-md border-2 border-primary'
					>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<CardTitle className='text-2xl'>
									{plan.charAt(0).toUpperCase() + plan.slice(1)}
								</CardTitle>
								<Badge variant='secondary'>{t(`${plan}.badge`)}</Badge>
							</div>
							<CardDescription>{t(`${plan}.description`)}</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='bg-muted/50 p-4 rounded-lg'>
								<p className='text-sm text-muted-foreground'>
									{t(`${plan}.notice`)}
								</p>
							</div>

							<div className='space-y-3'>
								<div className='flex items-start gap-3'>
									<Check className='size-5 text-primary shrink-0 mt-0.5' />
									<span className='text-sm'>
										{t(`${plan}.features.emails`, {
											count: limits.emailsPerMonth,
										})}
									</span>
								</div>
								<div className='flex items-start gap-3'>
									<Check className='size-5 text-primary shrink-0 mt-0.5' />
									<span className='text-sm'>
										{t(`${plan}.features.workspaces`, {
											count: limits.workspacesMax,
										})}
									</span>
								</div>
								<div className='flex items-start gap-3'>
									<Check className='size-5 text-primary shrink-0 mt-0.5' />
									<span className='text-sm'>
										{t(`${plan}.features.templates`, {
											count: limits.templatesPerWorkspace,
										})}
									</span>
								</div>
								<div className='flex items-start gap-3'>
									<Check className='size-5 text-primary shrink-0 mt-0.5' />
									<span className='text-sm'>
										{t(`${plan}.features.apiCalls`, {
											count: limits.apiCallsPerMonth,
										})}
									</span>
								</div>
								<div className='flex items-start gap-3'>
									<Check
										className={cn(
											'text-muted size-5 shrink-0 mt-0.5',
											limits.features.communitySupport && 'text-primary'
										)}
									/>
									<span className='text-sm'>{t('free.features.support')}</span>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleSelectPlan(plan as PlanName)}
								className='w-full'
								size='lg'
							>
								{t('selectPlan')}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
