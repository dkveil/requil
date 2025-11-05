import { LoginForm } from '@/features/auth';
import AuthLayout from '@/features/auth/layout/auth-layout';

export default function LoginPage() {
	return (
		<AuthLayout>
			<LoginForm />
		</AuthLayout>
	);
}
