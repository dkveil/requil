'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/features/workspace';
import { getErrorMessage } from '@/lib/api/error';
import { useCreateApiKey } from '../hooks/use-create-api-key';

const createApiKeySchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
});

type CreateApiKeyFormInput = z.infer<typeof createApiKeySchema>;

type CreateApiKeyDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateApiKeyDialog({
	open,
	onOpenChange,
}: CreateApiKeyDialogProps) {
	const t = useTranslations('settings.developers.apiKeys.create');
	const tMessages = useTranslations('settings.developers.apiKeys.messages');
	const locale = useLocale();
	const { currentWorkspace } = useWorkspace();
	const createApiKey = useCreateApiKey();

	const [step, setStep] = useState<'form' | 'success'>('form');
	const [newKey, setNewKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const form = useForm<CreateApiKeyFormInput>({
		resolver: zodResolver(createApiKeySchema),
		defaultValues: {
			name: '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = form;

	const onSubmit = async (data: CreateApiKeyFormInput) => {
		if (!currentWorkspace?.id) {
			toast.error('No workspace selected');
			return;
		}

		try {
			const result = await createApiKey.mutateAsync({
				workspaceId: currentWorkspace.id,
				data,
			});
			setNewKey(result.key);
			setStep('success');
			toast.success(tMessages('createSuccess'));
		} catch (err) {
			if (err instanceof Error && err.message.includes('not implemented')) {
				toast.warning('API endpoint not ready yet', {
					description: 'API key creation will be available soon',
				});
				onOpenChange(false);
			} else {
				toast.error(tMessages('createError'), {
					description: getErrorMessage(err, locale),
				});
			}
		}
	};

	const handleCopy = async () => {
		if (newKey) {
			await navigator.clipboard.writeText(newKey);
			setCopied(true);
			toast.success(tMessages('copySuccess'));
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		setTimeout(() => {
			setStep('form');
			setNewKey(null);
			setCopied(false);
			reset();
		}, 200);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}
		>
			<DialogContent>
				{step === 'form' && (
					<>
						<DialogHeader>
							<DialogTitle>{t('title')}</DialogTitle>
							<DialogDescription>{t('description')}</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleSubmit(onSubmit)}
							className='space-y-6'
						>
							<Field>
								<FieldLabel htmlFor='name'>{t('nameLabel')}</FieldLabel>
								<Input
									id='name'
									placeholder={t('namePlaceholder')}
									disabled={isSubmitting}
									{...register('name')}
								/>
								<FieldDescription>{t('nameDescription')}</FieldDescription>
							</Field>

							<div className='flex justify-end gap-3'>
								<Button
									type='button'
									variant='outline'
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{t('cancel')}
								</Button>
								<Button
									type='submit'
									disabled={isSubmitting}
								>
									{isSubmitting ? t('creating') : t('create')}
								</Button>
							</div>
						</form>
					</>
				)}

				{step === 'success' && newKey && (
					<>
						<DialogHeader>
							<DialogTitle>{t('successTitle')}</DialogTitle>
							<DialogDescription>{t('successDescription')}</DialogDescription>
						</DialogHeader>

						<div className='space-y-4'>
							<div className='rounded-lg border bg-muted/50 p-4'>
								<code className='break-all text-sm'>{newKey}</code>
							</div>

							<div className='flex gap-3'>
								<Button
									variant='outline'
									className='flex-1'
									onClick={handleCopy}
								>
									{copied ? (
										<>
											<Check className='mr-2 size-4' />
											{t('copied')}
										</>
									) : (
										<>
											<Copy className='mr-2 size-4' />
											{t('copyKey')}
										</>
									)}
								</Button>
								<Button onClick={handleClose}>{t('close')}</Button>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
