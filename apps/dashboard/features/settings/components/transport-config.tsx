'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useWorkspace } from '@/features/workspace';
import { getErrorMessage } from '@/lib/api/error';
import { useTransportConfig } from '../hooks/use-transport-config';
import { useUpdateTransport } from '../hooks/use-update-transport';
import { useVerifyTransport } from '../hooks/use-verify-transport';
import { CustomResendForm } from './custom-resend-form';
import { SmtpConfigForm } from './smtp-config-form';
import { TransportStatusBadge } from './transport-status-badge';

type TransportProvider = 'internal_resend' | 'custom_resend' | 'smtp';

export function TransportConfig() {
	const t = useTranslations('settings.transport');
	const locale = useLocale();
	const { currentWorkspace } = useWorkspace();
	const { data: transportConfig } = useTransportConfig();
	const updateTransport = useUpdateTransport();
	const verifyTransport = useVerifyTransport();

	const [selectedProvider, setSelectedProvider] =
		useState<TransportProvider>('internal_resend');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

	const transportProviders = [
		{
			value: 'internal_resend' as TransportProvider,
			label: t('providers.internalResend.label'),
			description: t('providers.internalResend.description'),
			available: true,
		},
		{
			value: 'custom_resend' as TransportProvider,
			label: t('providers.customResend.label'),
			description: t('providers.customResend.description'),
			available: false,
			badge: t('providers.customResend.badge'),
		},
		{
			value: 'smtp' as TransportProvider,
			label: t('providers.smtp.label'),
			description: t('providers.smtp.description'),
			available: false,
			badge: t('providers.smtp.badge'),
		},
	];

	const handleSave = async () => {
		if (!currentWorkspace?.id) {
			toast.error('No workspace selected');
			return;
		}

		setIsSubmitting(true);
		try {
			await updateTransport.mutateAsync({
				workspaceId: currentWorkspace.id,
				data: {
					type: selectedProvider === 'smtp' ? 'smtp' : 'resend',
				},
			});
			toast.success(t('messages.saveSuccess'));
		} catch (err) {
			if (err instanceof Error && err.message.includes('not implemented')) {
				toast.warning('API endpoint not ready yet', {
					description: 'Transport configuration will be available soon',
				});
			} else {
				toast.error(t('messages.saveError'), {
					description: getErrorMessage(err, locale),
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerify = async () => {
		if (!currentWorkspace?.id) {
			toast.error('No workspace selected');
			return;
		}

		setIsVerifying(true);
		try {
			await verifyTransport.mutateAsync({
				workspaceId: currentWorkspace.id,
			});
			toast.success(t('messages.verifySuccess'));
		} catch (err) {
			if (err instanceof Error && err.message.includes('not implemented')) {
				toast.warning('API endpoint not ready yet', {
					description: 'Transport verification will be available soon',
				});
			} else {
				toast.error(t('messages.verifyError'), {
					description: getErrorMessage(err, locale),
				});
			}
		} finally {
			setIsVerifying(false);
		}
	};

	const showForm = selectedProvider !== 'internal_resend';

	return (
		<div className='space-y-6'>
			{transportConfig && (
				<div className='flex items-center justify-between rounded-lg border bg-muted/50 p-4'>
					<div>
						<p className='text-sm font-medium'>Current Status</p>
						<p className='text-xs text-muted-foreground'>
							Last updated:{' '}
							{new Date(transportConfig.updatedAt).toLocaleDateString()}
						</p>
					</div>
					<TransportStatusBadge status={transportConfig.state} />
				</div>
			)}

			<div className='space-y-4'>
				<Label>{t('provider.label')}</Label>
				<RadioGroup
					value={selectedProvider}
					onValueChange={(value) =>
						setSelectedProvider(value as TransportProvider)
					}
					className='space-y-3'
				>
					{transportProviders.map((provider) => (
						<div
							key={provider.value}
							className={`flex items-start space-x-3 rounded-lg border p-4 ${
								!provider.available
									? 'cursor-not-allowed opacity-60'
									: 'cursor-pointer hover:bg-accent'
							}`}
						>
							<RadioGroupItem
								value={provider.value}
								id={provider.value}
								disabled={!provider.available}
								className='mt-0.5'
							/>
							<div className='flex-1 space-y-1'>
								<div className='flex items-center gap-2'>
									<Label
										htmlFor={provider.value}
										className='cursor-pointer font-medium'
									>
										{provider.label}
									</Label>
									{provider.badge && (
										<Badge
											variant='secondary'
											className='text-xs'
										>
											{provider.badge}
										</Badge>
									)}
								</div>
								<p className='text-sm text-muted-foreground'>
									{provider.description}
								</p>
							</div>
						</div>
					))}
				</RadioGroup>
			</div>

			{selectedProvider === 'internal_resend' && (
				<div className='rounded-lg border bg-muted/50 p-4'>
					<p className='text-sm text-muted-foreground'>
						{t('internalResendInfo')}
					</p>
				</div>
			)}

			{selectedProvider === 'custom_resend' && showForm && (
				<>
					<Separator />
					<CustomResendForm isSubmitting={isSubmitting} />
					<div className='flex justify-end gap-3'>
						<Button
							variant='outline'
							onClick={handleVerify}
							disabled={isSubmitting || isVerifying}
						>
							{isVerifying ? t('actions.verifying') : t('actions.verify')}
						</Button>
						<Button
							onClick={handleSave}
							disabled={isSubmitting || isVerifying}
						>
							{isSubmitting ? t('actions.saving') : t('actions.save')}
						</Button>
					</div>
				</>
			)}

			{selectedProvider === 'smtp' && showForm && (
				<>
					<Separator />
					<SmtpConfigForm isSubmitting={isSubmitting} />
					<div className='flex justify-end gap-3'>
						<Button
							variant='outline'
							onClick={handleVerify}
							disabled={isSubmitting || isVerifying}
						>
							{isVerifying ? t('actions.verifying') : t('actions.verify')}
						</Button>
						<Button
							onClick={handleSave}
							disabled={isSubmitting || isVerifying}
						>
							{isSubmitting ? t('actions.saving') : t('actions.save')}
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
