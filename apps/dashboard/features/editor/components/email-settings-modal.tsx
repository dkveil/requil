'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCanvas } from '../hooks/use-canvas';
import { useEditor } from '../hooks/use-editor';

const MAX_SUBJECT_LENGTH = 78;
const MAX_PREHEADER_LENGTH = 140;
const MAX_SENDER_NAME_LENGTH = 50;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailSettingsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface FormData {
	subject: string;
	preheader: string;
	senderName: string;
	senderEmail: string;
	useReplyTo: boolean;
	replyToEmail: string;
}

interface FormErrors {
	subject?: string;
	senderName?: string;
	senderEmail?: string;
	replyToEmail?: string;
}

const validateEmail = (email: string): boolean => {
	return EMAIL_REGEX.test(email);
};

export function EmailSettingsModal({
	open,
	onOpenChange,
}: EmailSettingsModalProps) {
	const t = useTranslations('editor.emailSettings');
	const tCommon = useTranslations('common');
	const { document, updateMetadata } = useCanvas();
	const { projectName, defaultSenderEmail, defaultSenderName } = useEditor();

	const [formData, setFormData] = useState<FormData>({
		subject: '',
		preheader: '',
		senderName: '',
		senderEmail: '',
		useReplyTo: true,
		replyToEmail: '',
	});

	const [errors, setErrors] = useState<FormErrors>({});

	useEffect(() => {
		if (open && document) {
			const metadata = document.metadata || {};
			setFormData({
				subject: metadata.subject || projectName || '',
				preheader: metadata.preheader || '',
				senderName: metadata.senderName || defaultSenderName || '',
				senderEmail: metadata.senderEmail || defaultSenderEmail || '',
				useReplyTo: metadata.useReplyTo ?? true,
				replyToEmail: metadata.replyToEmail || '',
			});
			setErrors({});
		}
	}, [open, document, projectName, defaultSenderEmail, defaultSenderName]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.subject.trim()) {
			newErrors.subject = t('validation.subjectRequired');
		} else if (formData.subject.length > MAX_SUBJECT_LENGTH) {
			newErrors.subject = t('validation.subjectTooLong');
		}

		if (!formData.senderName.trim()) {
			newErrors.senderName = t('validation.senderNameRequired');
		} else if (formData.senderName.length > MAX_SENDER_NAME_LENGTH) {
			newErrors.senderName = t('validation.senderNameTooLong');
		}

		if (!formData.senderEmail.trim()) {
			newErrors.senderEmail = t('validation.senderEmailRequired');
		} else if (!validateEmail(formData.senderEmail)) {
			newErrors.senderEmail = t('validation.senderEmailInvalid');
		}

		if (
			!formData.useReplyTo &&
			formData.replyToEmail &&
			!validateEmail(formData.replyToEmail)
		) {
			newErrors.replyToEmail = t('validation.replyToEmailInvalid');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (!validateForm()) {
			return;
		}

		const metadata = {
			subject: formData.subject.trim(),
			preheader: formData.preheader.trim(),
			senderName: formData.senderName.trim(),
			senderEmail: formData.senderEmail.trim(),
			useReplyTo: formData.useReplyTo,
			replyToEmail: formData.useReplyTo
				? formData.senderEmail.trim()
				: formData.replyToEmail.trim(),
		};

		updateMetadata(metadata);
		toast.success(t('saved'));
		onOpenChange(false);
	};

	const handleFieldChange = <K extends keyof FormData>(
		field: K,
		value: FormData[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		if (errors[field as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const subjectCharsRemaining = MAX_SUBJECT_LENGTH - formData.subject.length;
	const preheaderCharsRemaining =
		MAX_PREHEADER_LENGTH - formData.preheader.length;
	const senderNameCharsRemaining =
		MAX_SENDER_NAME_LENGTH - formData.senderName.length;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='subject'>
							{t('fields.subject')} <span className='text-destructive'>*</span>
						</Label>
						<Input
							id='subject'
							value={formData.subject}
							onChange={(e) => handleFieldChange('subject', e.target.value)}
							placeholder={t('placeholders.subject')}
							maxLength={MAX_SUBJECT_LENGTH + 20}
							className={errors.subject ? 'border-destructive' : ''}
						/>
						<div className='flex justify-between text-xs'>
							<span className='text-destructive'>{errors.subject}</span>
							<span
								className={
									subjectCharsRemaining < 0
										? 'text-destructive'
										: 'text-muted-foreground'
								}
							>
								{t('characterCount', {
									current: formData.subject.length,
									max: MAX_SUBJECT_LENGTH,
								})}
							</span>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='preheader'>{t('fields.preheader')}</Label>
						<Textarea
							id='preheader'
							value={formData.preheader}
							onChange={(e) => handleFieldChange('preheader', e.target.value)}
							placeholder={t('placeholders.preheader')}
							className='min-h-20 resize-none'
							maxLength={MAX_PREHEADER_LENGTH + 50}
						/>
						<div className='flex justify-end text-xs'>
							<span
								className={
									preheaderCharsRemaining < 0
										? 'text-destructive'
										: 'text-muted-foreground'
								}
							>
								{t('characterCount', {
									current: formData.preheader.length,
									max: MAX_PREHEADER_LENGTH,
								})}
							</span>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='senderName'>
								{t('fields.senderName')}{' '}
								<span className='text-destructive'>*</span>
							</Label>
							<Input
								id='senderName'
								value={formData.senderName}
								onChange={(e) =>
									handleFieldChange('senderName', e.target.value)
								}
								placeholder={t('placeholders.senderName')}
								maxLength={MAX_SENDER_NAME_LENGTH + 10}
								className={errors.senderName ? 'border-destructive' : ''}
							/>
							<div className='flex justify-between text-xs'>
								<span className='text-destructive'>{errors.senderName}</span>
								<span
									className={
										senderNameCharsRemaining < 0
											? 'text-destructive'
											: 'text-muted-foreground'
									}
								>
									{t('characterCount', {
										current: formData.senderName.length,
										max: MAX_SENDER_NAME_LENGTH,
									})}
								</span>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='senderEmail'>
								{t('fields.senderEmail')}{' '}
								<span className='text-destructive'>*</span>
							</Label>
							<Input
								id='senderEmail'
								type='email'
								value={formData.senderEmail}
								onChange={(e) =>
									handleFieldChange('senderEmail', e.target.value)
								}
								placeholder={t('placeholders.senderEmail')}
								className={errors.senderEmail ? 'border-destructive' : ''}
							/>
							{errors.senderEmail && (
								<span className='text-xs text-destructive'>
									{errors.senderEmail}
								</span>
							)}
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center space-x-2'>
							<input
								id='useReplyTo'
								type='checkbox'
								checked={formData.useReplyTo}
								onChange={(e) =>
									handleFieldChange('useReplyTo', e.target.checked)
								}
								className='h-4 w-4 rounded border-gray-300'
							/>
							<Label htmlFor='useReplyTo'>{t('fields.useReplyTo')}</Label>
						</div>

						{!formData.useReplyTo && (
							<div className='ml-6 space-y-2'>
								<Label htmlFor='replyToEmail'>{t('fields.replyToEmail')}</Label>
								<Input
									id='replyToEmail'
									type='email'
									value={formData.replyToEmail}
									onChange={(e) =>
										handleFieldChange('replyToEmail', e.target.value)
									}
									placeholder={t('placeholders.replyToEmail')}
									className={errors.replyToEmail ? 'border-destructive' : ''}
								/>
								{errors.replyToEmail && (
									<span className='text-xs text-destructive'>
										{errors.replyToEmail}
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
					>
						{tCommon('cancel')}
					</Button>
					<Button onClick={handleSave}>{tCommon('save')}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
