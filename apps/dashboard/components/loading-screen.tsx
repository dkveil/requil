import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
	text?: string;
	className?: string;
}

export function LoadingScreen({ text, className }: LoadingScreenProps) {
	return (
		<div
			className={cn('flex min-h-screen items-center justify-center', className)}
		>
			<div className='flex flex-col items-center gap-3'>
				<Loader2 className='size-8 animate-spin text-primary' />
				{text && (
					<p className='text-sm text-muted-foreground animate-pulse'>{text}</p>
				)}
			</div>
		</div>
	);
}
