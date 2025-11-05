'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiClientError, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/use-auth';

const registerSchema = z
	.object({
		email: z.string().email({ message: 'Invalid email address' }),
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' }),
		confirmPassword: z.string().min(1, { message: 'Please confirm password' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<'form'>) {
	const { signUp, signIn } = useAuth();
	const router = useRouter();
	const locale = useLocale();
	const tAuth = useTranslations('auth.register');
	const tCommon = useTranslations('common');

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: RegisterFormValues) => {
		try {
			await signUp(values.email, values.password);
			await signIn(values.email, values.password);
			toast.success(tAuth('successTitle'), {
				description: tAuth('success'),
			});
			router.push('/');
			router.refresh();
		} catch (err) {
			toast.error(tAuth('failed'), {
				description: getErrorMessage(err, locale),
			});

			if (err instanceof ApiClientError && err.code === 'USER_ALREADY_EXISTS') {
				setTimeout(() => {
					router.push('/auth/login');
				}, 3000);
			}
		}
	};

	const onError = (errors: typeof form.formState.errors) => {
		const errorMessages = Object.values(errors)
			.map((error) => error?.message)
			.filter(Boolean)
			.join(', ');

		toast.error(tCommon('validationError'), {
			description: errorMessages || tCommon('validationErrorDescription'),
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
					<FieldLabel htmlFor='password'>{tAuth('password')}</FieldLabel>
					<Input
						id='password'
						type='password'
						placeholder={tAuth('passwordPlaceholder')}
						disabled={isSubmitting}
						{...register('password')}
					/>
					<p className='text-muted-foreground text-sm'>
						{tAuth('passwordHint')}
					</p>
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
						{isSubmitting
							? tCommon('actions.signingUp')
							: tCommon('actions.signUp')}
					</Button>
				</Field>

				<FieldSeparator>{tCommon('continueWith')}</FieldSeparator>
				<Field>
					<Button
						variant='outline'
						type='button'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
								fill='currentColor'
							/>
						</svg>
						{tCommon('actions.signUpWithGithub')}
					</Button>
					<FieldDescription className='text-center'>
						{tAuth('hasAccount')}{' '}
						<Link
							href={DASHBOARD_ROUTES.AUTH.LOGIN}
							className='underline underline-offset-4'
						>
							{tCommon('actions.signIn')}
						</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
