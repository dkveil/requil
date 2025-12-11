import { ForgotPasswordForm } from '@/features/auth';
import AuthLayout from '@/features/auth/layout/auth-layout';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata() {
	return generatePageMetadata('forgotPassword');
}

export default function ForgotPasswordPage() {
	return (
		<AuthLayout>
			<ForgotPasswordForm className='max-w-xs w-full flex flex-col gap-6 mx-auto' />
		</AuthLayout>
	);
}
