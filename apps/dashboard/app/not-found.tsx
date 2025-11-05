import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<h1 className='text-6xl font-bold text-gray-900'>404</h1>
				<p className='mt-4 text-xl text-gray-600'>
					Strona nie została znaleziona
				</p>
				<div className='mt-6'>
					<Button asChild>
						<Link href='/'>Wróć do strony głównej</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
