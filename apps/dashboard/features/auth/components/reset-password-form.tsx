'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' }),
		confirmPassword: z
			.string()
			.min(1, { message: 'Password confirmation is required' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
	className,
	...props
}: React.ComponentProps<'form'>) {
	const tAuth = useTranslations('auth.resetPasswordPage');
	const tCommon = useTranslations('common');
	const router = useRouter();

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (_values: ResetPasswordFormValues) => {
		// Mock backend call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		toast.success(tAuth('successTitle'), {
			description: tAuth('success'),
		});

		router.push(DASHBOARD_ROUTES.AUTH.LOGIN);
	};

	const onError = (errors: typeof form.formState.errors) => {
		const errorMessages = Object.values(errors)
			.map((error) => error?.message)
			.filter(Boolean)
			.join(', ');

		toast.error(tCommon('validationError'), {
			description: errorMessages || 'Please check the form',
		});
	};

	return (
		<form
			className={cn('flex flex-col gap-6', className)}
			onSubmit={handleSubmit(onSubmit, onError)}
			{...props}
		>
			<FieldGroup>
				<div className='flex flex-col items-center gap-1 text-center'>
					<h1 className='text-2xl font-bold'>{tAuth('title')}</h1>
					<p className='text-muted-foreground text-sm text-balance'>
						{tAuth('subtitle')}
					</p>
				</div>

				<div className='max-w-xs w-full flex flex-col gap-6 mx-auto'>
					<Field>
						<FieldLabel htmlFor='password'>{tAuth('password')}</FieldLabel>
						<Input
							id='password'
							type='password'
							placeholder={tAuth('passwordPlaceholder')}
							disabled={isSubmitting}
							{...register('password')}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor='confirmPassword'>
							{tAuth('confirmPassword')}
						</FieldLabel>
						<Input
							id='confirmPassword'
							type='password'
							placeholder={tAuth('confirmPasswordPlaceholder')}
							disabled={isSubmitting}
							{...register('confirmPassword')}
						/>
					</Field>

					<Field>
						<Button
							type='submit'
							className='w-full'
							disabled={isSubmitting}
						>
							{isSubmitting ? `${tAuth('submit')}...` : tAuth('submit')}
						</Button>
					</Field>
				</div>
			</FieldGroup>
		</form>
	);
}
