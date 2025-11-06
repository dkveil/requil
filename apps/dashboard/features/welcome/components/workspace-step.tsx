'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore, workspaceApi } from '@/features/workspace';
import { useWelcomeStore } from '../stores/welcome-store';

const REGEX_SLUG = /^[a-z0-9-]+$/;
const REGEX_SPACES = /\s+/g;
const REGEX_NON_SLUG_CHARS = /[^a-z0-9-]/g;

const workspaceSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	slug: z
		.string()
		.min(3, 'Slug must be at least 3 characters')
		.regex(
			REGEX_SLUG,
			'Slug must contain only lowercase letters, numbers, and hyphens'
		),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export function WorkspaceStep() {
	const t = useTranslations('welcome.workspace');
	const tCommon = useTranslations('common');
	const router = useRouter();
	const { setWorkspaceData } = useWelcomeStore();
	const { loadWorkspaces } = useWorkspaceStore();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<WorkspaceFormData>({
		resolver: zodResolver(workspaceSchema),
		defaultValues: {
			name: '',
			slug: '',
		},
	});

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const slug = value
			.toLowerCase()
			.replace(REGEX_SPACES, '-')
			.replace(REGEX_NON_SLUG_CHARS, '');
		setValue('slug', slug);
	};

	const onSubmit = async (data: WorkspaceFormData) => {
		try {
			await workspaceApi.create({ name: data.name, slug: data.slug });

			setWorkspaceData(data);

			await loadWorkspaces();

			toast.success(tCommon('success'), {
				description: 'Workspace created successfully',
			});

			router.push('/');
		} catch (error) {
			toast.error(tCommon('error'), {
				description:
					error instanceof Error ? error.message : 'Failed to create workspace',
			});
		}
	};

	return (
		<div className='space-y-6'>
			<div className='text-center space-y-2'>
				<h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
				<p className='text-muted-foreground'>{t('description')}</p>
			</div>

			<div className='flex justify-center'>
				<Card className='w-full max-w-md'>
					<CardHeader>
						<CardTitle>{t('title')}</CardTitle>
						<CardDescription>{t('description')}</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit(onSubmit)}
							className='space-y-4'
						>
							<Field>
								<FieldLabel htmlFor='name'>{t('form.name.label')}</FieldLabel>
								<Input
									id='name'
									placeholder={t('form.name.placeholder')}
									disabled={isSubmitting}
									{...register('name', {
										onChange: handleNameChange,
									})}
								/>
							</Field>

							<Field>
								<FieldLabel htmlFor='slug'>{t('form.slug.label')}</FieldLabel>
								<Input
									id='slug'
									placeholder={t('form.slug.placeholder')}
									disabled={isSubmitting}
									{...register('slug')}
								/>
								<FieldDescription>
									{t('form.slug.description')}
								</FieldDescription>
							</Field>

							<Button
								type='submit'
								className='w-full'
								size='lg'
								disabled={isSubmitting}
							>
								{isSubmitting ? t('creating') : t('create')}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
