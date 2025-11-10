'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/features/workspace';
import { useTemplateStore } from '../stores/template-store';

const createTemplateFormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
	stableId: z
		.string()
		.min(3, 'Stable ID must be at least 3 characters')
		.max(100, 'Stable ID is too long')
		.regex(
			/^[a-z0-9-]+$/,
			'Stable ID can only contain lowercase letters, numbers, and hyphens'
		),
	description: z.string().max(1000, 'Description is too long').optional(),
});

type CreateTemplateFormValues = z.infer<typeof createTemplateFormSchema>;

type Props = {
	workspaceSlug: string;
	translations: {
		title: string;
		description: string;
		nameLabel: string;
		namePlaceholder: string;
		nameDescription: string;
		stableIdLabel: string;
		stableIdPlaceholder: string;
		stableIdDescription: string;
		descriptionLabel: string;
		descriptionPlaceholder: string;
		descriptionDescription: string;
		cancel: string;
		create: string;
		creating: string;
		successTitle: string;
		successDescription: string;
		errorTitle: string;
		errorDescription: string;
	};
};

export function CreateTemplateForm({ workspaceSlug, translations: t }: Props) {
	const router = useRouter();
	const { currentWorkspace } = useWorkspace();
	const { createTemplate } = useTemplateStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<CreateTemplateFormValues>({
		resolver: zodResolver(createTemplateFormSchema),
		defaultValues: {
			name: '',
			stableId: '',
			description: '',
		},
	});

	const handleNameChange = (name: string) => {
		const stableId = name
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');

		form.setValue('stableId', stableId);
	};

	const onSubmit = async (data: CreateTemplateFormValues) => {
		if (!currentWorkspace) {
			toast.error(t.errorTitle, {
				description: 'No workspace selected',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const template = await createTemplate({
				workspaceId: currentWorkspace.id,
				name: data.name,
				stableId: data.stableId,
				description: data.description || undefined,
			});

			toast.success(t.successTitle, {
				description: t.successDescription,
			});

			// Navigate to editor
			router.push(
				DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATE_EDITOR(
					workspaceSlug,
					template.id
				)
			);
		} catch (error) {
			console.error('Failed to create template:', error);
			toast.error(t.errorTitle, {});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='mx-auto max-w-3xl flex flex-col gap-6 p-8'>
			<div className='flex items-center gap-4'>
				<Button
					variant='ghost'
					size='icon'
					asChild
				>
					<Link
						href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATES(workspaceSlug)}
					>
						<ArrowLeft />
					</Link>
				</Button>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>{t.title}</h1>
					<p className='text-muted-foreground mt-1'>{t.description}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Template Details</CardTitle>
					<CardDescription>
						Provide basic information about your email template
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-6'
						>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t.nameLabel}</FormLabel>
										<FormControl>
											<Input
												placeholder={t.namePlaceholder}
												{...field}
												onChange={(e) => {
													field.onChange(e);
													handleNameChange(e.target.value);
												}}
											/>
										</FormControl>
										<FormDescription>{t.nameDescription}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='stableId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t.stableIdLabel}</FormLabel>
										<FormControl>
											<Input
												placeholder={t.stableIdPlaceholder}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t.stableIdDescription}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t.descriptionLabel}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t.descriptionPlaceholder}
												rows={4}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											{t.descriptionDescription}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='flex gap-3 justify-end'>
								<Button
									type='button'
									variant='outline'
									asChild
								>
									<Link
										href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATES(
											workspaceSlug
										)}
									>
										{t.cancel}
									</Link>
								</Button>
								<Button
									type='submit'
									disabled={isSubmitting}
								>
									{isSubmitting && <Loader2 className='animate-spin' />}
									{isSubmitting ? t.creating : t.create}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
