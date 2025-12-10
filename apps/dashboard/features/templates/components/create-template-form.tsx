'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import {
	ArrowLeft,
	FileText,
	LayoutGrid,
	Loader2,
	Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWorkspace } from '@/features/workspace';
import { ApiClientError, getErrorMessage } from '@/lib/api/error';
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
type TemplateSourceType = 'blank' | 'ai' | 'gallery';

type Props = {
	workspaceSlug: string;
	translations: {
		backToTemplates: string;
		title: string;
		description: string;
		detailsTitle: string;
		detailsDescription: string;
		nameLabel: string;
		namePlaceholder: string;
		nameDescription: string;
		stableIdLabel: string;
		stableIdPlaceholder: string;
		stableIdDescription: string;
		descriptionLabel: string;
		descriptionPlaceholder: string;
		descriptionDescription: string;
		sourceTitle: string;
		sourceDescription: string;
		sourceBlankTitle: string;
		sourceBlankDescription: string;
		sourceAiTitle: string;
		sourceAiDescription: string;
		sourceAiTooltip: string;
		sourceGalleryTitle: string;
		sourceGalleryDescription: string;
		sourceGalleryTooltip: string;
		cancel: string;
		create: string;
		creating: string;
		successTitle: string;
		successDescription: string;
		errorTitle: string;
		errorDescription: string;
		errorStableIdTaken: string;
	};
};

export function CreateTemplateForm({ workspaceSlug, translations: t }: Props) {
	const router = useRouter();
	const { currentWorkspace } = useWorkspace();
	const { createTemplate } = useTemplateStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isStableIdTouched, setIsStableIdTouched] = useState(false);
	const [selectedSource, setSelectedSource] =
		useState<TemplateSourceType>('blank');

	const form = useForm<CreateTemplateFormValues>({
		resolver: zodResolver(createTemplateFormSchema),
		defaultValues: {
			name: '',
			stableId: '',
			description: '',
		},
	});

	const nameValue = form.watch('name');

	useEffect(() => {
		if (!isStableIdTouched && nameValue) {
			const stableId = nameValue
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-');

			form.setValue('stableId', stableId, { shouldValidate: false });
		}
	}, [nameValue, isStableIdTouched, form]);

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

			router.push(
				DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATE_EDITOR(
					workspaceSlug,
					template.id
				)
			);
		} catch (error) {
			if (error instanceof ApiClientError) {
				if (error.statusCode === 409) {
					form.setError('stableId', {
						type: 'manual',
						message: t.errorStableIdTaken,
					});
					return;
				}

				toast.error(t.errorTitle, {
					description: getErrorMessage(error),
				});
			} else {
				toast.error(t.errorTitle, {
					description: t.errorDescription,
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='mx-auto max-w-5xl flex flex-col gap-8 p-8'>
			<div className='space-y-2'>
				<Button
					variant='ghost'
					size='sm'
					className='-ml-2 mb-2'
					asChild
				>
					<Link
						href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATES(workspaceSlug)}
					>
						<ArrowLeft className='h-4 w-4' />
						{t.backToTemplates}
					</Link>
				</Button>
				<h1 className='text-4xl font-bold tracking-tight'>{t.title}</h1>
				<p className='text-muted-foreground text-lg'>{t.description}</p>
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='space-y-6'
				>
					<Card>
						<CardHeader>
							<CardTitle>{t.detailsTitle}</CardTitle>
							<CardDescription>{t.detailsDescription}</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
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
												onChange={(e) => {
													setIsStableIdTouched(true);
													field.onChange(e);
												}}
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
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t.sourceTitle}</CardTitle>
							<CardDescription>{t.sourceDescription}</CardDescription>
						</CardHeader>
						<CardContent>
							<TooltipProvider>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<Card
										className={`cursor-pointer transition-all hover:border-primary ${
											selectedSource === 'blank'
												? 'border-primary bg-primary/5'
												: 'border-border'
										}`}
										onClick={() => setSelectedSource('blank')}
									>
										<CardHeader className='text-center'>
											<div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
												<FileText className='h-6 w-6 text-primary' />
											</div>
											<CardTitle className='text-lg'>
												{t.sourceBlankTitle}
											</CardTitle>
											<CardDescription className='text-sm'>
												{t.sourceBlankDescription}
											</CardDescription>
										</CardHeader>
									</Card>

									<Tooltip>
										<TooltipTrigger asChild>
											<Card className='cursor-not-allowed opacity-50 border-border'>
												<CardHeader className='text-center'>
													<div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
														<Sparkles className='h-6 w-6 text-muted-foreground' />
													</div>
													<CardTitle className='text-lg'>
														{t.sourceAiTitle}
													</CardTitle>
													<CardDescription className='text-sm'>
														{t.sourceAiDescription}
													</CardDescription>
												</CardHeader>
											</Card>
										</TooltipTrigger>
										<TooltipContent>
											<p>{t.sourceAiTooltip}</p>
										</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<Card className='cursor-not-allowed opacity-50 border-border'>
												<CardHeader className='text-center'>
													<div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
														<LayoutGrid className='h-6 w-6 text-muted-foreground' />
													</div>
													<CardTitle className='text-lg'>
														{t.sourceGalleryTitle}
													</CardTitle>
													<CardDescription className='text-sm'>
														{t.sourceGalleryDescription}
													</CardDescription>
												</CardHeader>
											</Card>
										</TooltipTrigger>
										<TooltipContent>
											<p>{t.sourceGalleryTooltip}</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</TooltipProvider>
						</CardContent>
					</Card>

					<div className='flex gap-3 justify-end'>
						<Button
							type='button'
							variant='outline'
							asChild
						>
							<Link
								href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATES(workspaceSlug)}
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
		</div>
	);
}
