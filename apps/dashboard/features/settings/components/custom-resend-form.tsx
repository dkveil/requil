'use client';

import { useTranslations } from 'next-intl';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type CustomResendFormProps = {
	isSubmitting?: boolean;
};

export function CustomResendForm({ isSubmitting }: CustomResendFormProps) {
	const t = useTranslations('settings.transport.customResendForm');

	return (
		<div className='space-y-6'>
			<Field>
				<FieldLabel htmlFor='apiKey'>{t('apiKey.label')}</FieldLabel>
				<Input
					id='apiKey'
					type='password'
					placeholder={t('apiKey.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('apiKey.description')}</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor='fromDomain'>{t('fromDomain.label')}</FieldLabel>
				<Input
					id='fromDomain'
					placeholder={t('fromDomain.placeholder')}
					disabled={isSubmitting}
				/>
				<FieldDescription>{t('fromDomain.description')}</FieldDescription>
			</Field>

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
