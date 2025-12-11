import { RegisterForm } from '@/features/auth';
import AuthLayout from '@/features/auth/layout/auth-layout';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata() {
	return generatePageMetadata('register');
}

export default function RegisterPage() {
	return (
		<AuthLayout>
			<RegisterForm className='max-w-xs w-full flex flex-col gap-6 mx-auto' />
		</AuthLayout>
	);
}
