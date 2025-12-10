'use client';

import { useTranslations } from 'next-intl';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type SmtpConfigFormProps = {
	isSubmitting?: boolean;
};

export function SmtpConfigForm({ isSubmitting }: SmtpConfigFormProps) {
	const t = useTranslations('settings.transport.smtpForm');

	return (
		<div className='space-y-6'>
			<Field>
				<FieldLabel htmlFor='smtpHost'>{t('host.label')}</FieldLabel>
				<Input
					id='smtpHost'
					placeholder={t('host.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('host.description')}</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor='smtpPort'>{t('port.label')}</FieldLabel>
				<Input
					id='smtpPort'
					type='number'
					placeholder={t('port.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('port.description')}</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor='smtpUser'>{t('user.label')}</FieldLabel>
				<Input
					id='smtpUser'
					placeholder={t('user.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('user.description')}</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor='smtpPassword'>{t('password.label')}</FieldLabel>
				<Input
					id='smtpPassword'
					type='password'
					placeholder={t('password.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('password.description')}</FieldDescription>
			</Field>

			<div className='flex items-center justify-between rounded-lg border p-4'>
				<div className='space-y-0.5'>
					<Label htmlFor='smtpSecure'>{t('secure.label')}</Label>
					<p className='text-sm text-muted-foreground'>
						{t('secure.description')}
					</p>
				</div>
				<Switch
					id='smtpSecure'
					disabled={isSubmitting}
					defaultChecked
				/>
			</div>

			<Field>
				<FieldLabel htmlFor='fromEmail'>{t('fromEmail.label')}</FieldLabel>
				<Input
					id='fromEmail'
					type='email'
					placeholder={t('fromEmail.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('fromEmail.description')}</FieldDescription>
			</Field>
		</div>
	);
}
