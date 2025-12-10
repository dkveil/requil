'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	type UpdateWorkspaceInput,
	updateWorkspaceSchema,
} from '@requil/types/workspace';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/features/workspace';
import { getErrorMessage } from '@/lib/api/error';
import { useUpdateWorkspace } from '../hooks/use-update-workspace';

export function UpdateWorkspaceForm() {
	const t = useTranslations('settings.general');
	const locale = useLocale();
	const { currentWorkspace } = useWorkspace();
	const updateWorkspace = useUpdateWorkspace();

	const form = useForm<UpdateWorkspaceInput>({
		resolver: zodResolver(updateWorkspaceSchema),
		defaultValues: {
			name: currentWorkspace?.name || '',
			slug: currentWorkspace?.slug || '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { isDirty, isSubmitting },
	} = form;

	const onSubmit = async (data: UpdateWorkspaceInput) => {
		if (!currentWorkspace) {
			toast.error(t('noWorkspace'));
			return;
		}

		try {
			await updateWorkspace.mutateAsync({
				workspaceId: currentWorkspace.id,
				data,
			});
			toast.success(t('success'));
		} catch (err) {
			toast.error(t('error'), {
				description: getErrorMessage(err, locale),
			});
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='space-y-6'
		>
			<Field>
				<FieldLabel htmlFor='name'>{t('form.name.label')}</FieldLabel>
				<Input
					id='name'
					placeholder={t('form.name.placeholder')}
					disabled={isSubmitting}
					{...register('name')}
				/>
				<FieldDescription>{t('form.name.description')}</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor='slug'>{t('form.slug.label')}</FieldLabel>
				<Input
					id='slug'
					placeholder={t('form.slug.placeholder')}
					disabled={isSubmitting}
					{...register('slug')}
				/>
				<FieldDescription>{t('form.slug.description')}</FieldDescription>
			</Field>

			<div className='flex justify-end'>
				<Button
					type='submit'
					disabled={!isDirty || isSubmitting}
				>
					{isSubmitting ? t('form.submitting') : t('form.submit')}
				</Button>
			</div>
		</form>
	);
}
