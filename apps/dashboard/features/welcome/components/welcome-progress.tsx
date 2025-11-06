'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { useWelcomeStore } from '../stores/welcome-store';

const STEPS = {
	pricing: 1,
	workspace: 2,
};

const TOTAL_STEPS = 2;

export function WelcomeProgress() {
	const t = useTranslations('welcome');
	const { currentStep } = useWelcomeStore();
	const currentStepNumber = STEPS[currentStep];
	const progress = (currentStepNumber / TOTAL_STEPS) * 100;

	return (
		<div className='space-y-2'>
			<div className='flex justify-between items-center text-sm'>
				<span className='text-muted-foreground'>
					{t('step', { current: currentStepNumber, total: TOTAL_STEPS })}
				</span>
				<span className='font-medium'>{Math.round(progress)}%</span>
			</div>
			<Progress value={progress} />
		</div>
	);
}
