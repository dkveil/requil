'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '../stores/auth-store';

const forgotPasswordSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentProps<'form'>) {
	const tAuth = useTranslations('auth.forgotPasswordPage');
	const tCommon = useTranslations('common');
	const locale = useLocale();
	const forgotPassword = useAuthStore((state) => state.forgotPassword);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: ForgotPasswordFormValues) => {
		try {
			await forgotPassword(values.email);

			toast.success(tAuth('successTitle'), {
				description: tAuth('success'),
			});
		} catch (err) {
			toast.error(tAuth('failed'), {
				description: getErrorMessage(err, locale),
			});
		}
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
						<FieldLabel htmlFor='email'>{tAuth('email')}</FieldLabel>
						<Input
							id='email'
							type='email'
							placeholder={tAuth('emailPlaceholder')}
							disabled={isSubmitting}
							{...register('email')}
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

					<div className='text-center text-sm'>
						<Link
							href={DASHBOARD_ROUTES.AUTH.LOGIN}
							className='text-muted-foreground hover:text-foreground transition-colors'
						>
							{tAuth('backToLogin')}
						</Link>
					</div>
				</div>
			</FieldGroup>
		</form>
	);
}
