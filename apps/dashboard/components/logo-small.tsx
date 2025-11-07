import { Mail } from 'lucide-react';

export default function LogoSmall() {
	return (
		<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary'>
			<Mail className='h-5 w-5 text-sidebar-primary-foreground' />
		</div>
	);
}
