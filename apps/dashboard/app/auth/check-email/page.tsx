import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function CheckEmailPage() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center'>
					<h1 className='text-3xl font-bold tracking-tight text-gray-900'>
						Sprawdź swoją skrzynkę email
					</h1>
				</div>

				<Alert variant='success'>
					<AlertTitle>Email został wysłany!</AlertTitle>
					<AlertDescription>
						Wysłaliśmy link aktywacyjny na Twój adres email. Kliknij w link, aby
						potwierdzić swoje konto.
					</AlertDescription>
				</Alert>

				<div className='text-center text-sm text-gray-600'>
					<p>Nie otrzymałeś emaila? Sprawdź folder spam.</p>
					<p className='mt-4'>
						<Link href='/auth/login'>
							<Button variant='outline'>Wróć do logowania</Button>
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
