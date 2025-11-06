'use client';

import { useWelcomeStore } from '../stores/welcome-store';
import { PricingStep } from './pricing-step';
import { WelcomeProgress } from './welcome-progress';
import { WorkspaceStep } from './workspace-step';

export function WelcomeContainer() {
	const { currentStep } = useWelcomeStore();

	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<div className='w-full max-w-4xl space-y-8'>
				<WelcomeProgress />

				{currentStep === 'pricing' && <PricingStep />}
				{currentStep === 'workspace' && <WorkspaceStep />}
			</div>
		</div>
	);
}
