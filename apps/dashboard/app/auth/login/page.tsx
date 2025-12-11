import { LoginForm } from '@/features/auth';
import AuthLayout from '@/features/auth/layout/auth-layout';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata() {
	return generatePageMetadata('login');
}

export default function LoginPage() {
	return (
		<AuthLayout>
			<LoginForm />
		</AuthLayout>
	);
}
