import { ResetPasswordForm } from '@/features/auth';
import AuthLayout from '@/features/auth/layout/auth-layout';

export default function ResetPasswordPage() {
	return (
		<AuthLayout>
			<ResetPasswordForm className='max-w-xs w-full flex flex-col gap-6 mx-auto' />
		</AuthLayout>
	);
}
