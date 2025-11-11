import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionProps {
	title: string;
	children: React.ReactNode;
	isExpanded: boolean;
	onToggle: () => void;
	showToggle?: boolean;
}

export function Section({
	title,
	children,
	isExpanded,
	onToggle,
	showToggle = true,
}: SectionProps) {
	return (
		<div className='border-b pb-3'>
			<button
				type='button'
				onClick={onToggle}
				className='w-full flex items-center justify-between mb-3 group'
			>
				<span className='text-sm font-medium text-foreground'>{title}</span>
				{showToggle && (
					<Plus
						className={cn(
							'h-4 w-4 text-muted-foreground transition-transform',
							isExpanded && 'rotate-45'
						)}
					/>
				)}
			</button>
			{isExpanded && <div className='space-y-3'>{children}</div>}
		</div>
	);
}
