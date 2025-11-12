import { cn } from '@/lib/utils';

type ComponentIconProps = {
	type: string;
	title?: string;
	className?: string;
};

export function ComponentIcon({ type, title, className }: ComponentIconProps) {
	switch (type) {
		case 'Container':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Container icon'}</title>
					<rect
						x='4'
						y='4'
						width='16'
						height='16'
						rx='2'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Section':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Section icon'}</title>
					<rect
						x='3'
						y='6'
						width='18'
						height='12'
						rx='2'
						strokeWidth='1.5'
					/>
					<line
						x1='3'
						y1='10'
						x2='21'
						y2='10'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Columns':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Columns icon'}</title>
					<rect
						x='4'
						y='4'
						width='6'
						height='16'
						rx='1'
						strokeWidth='1.5'
					/>
					<rect
						x='14'
						y='4'
						width='6'
						height='16'
						rx='1'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Column':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Column icon'}</title>
					<rect
						x='7'
						y='4'
						width='10'
						height='16'
						rx='1'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Spacer':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Spacer icon'}</title>
					<line
						x1='4'
						y1='12'
						x2='20'
						y2='12'
						strokeWidth='1.5'
						strokeDasharray='3 3'
					/>
				</svg>
			);
		case 'Divider':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Divider icon'}</title>
					<line
						x1='4'
						y1='12'
						x2='20'
						y2='12'
						strokeWidth='2'
					/>
				</svg>
			);
		case 'Text':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Text icon'}</title>
					<path
						d='M4 6h16M4 12h16M4 18h10'
						strokeWidth='1.5'
						strokeLinecap='round'
					/>
				</svg>
			);
		case 'Heading':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Heading icon'}</title>
					<path
						d='M4 6v12M20 6v12M4 12h16'
						strokeWidth='1.5'
						strokeLinecap='round'
					/>
				</svg>
			);
		case 'Button':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Button icon'}</title>
					<rect
						x='6'
						y='8'
						width='12'
						height='8'
						rx='1'
						strokeWidth='1.5'
					/>
					<path
						d='M10 12h4'
						strokeWidth='1.5'
						strokeLinecap='round'
					/>
				</svg>
			);
		case 'Image':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Image icon'}</title>
					<rect
						x='4'
						y='4'
						width='16'
						height='16'
						rx='2'
						strokeWidth='1.5'
					/>
					<circle
						cx='9'
						cy='9'
						r='1.5'
						fill='currentColor'
					/>
					<path
						d='M4 16l6-6 10 10'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			);
		default:
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Component icon'}</title>
					<rect
						x='4'
						y='4'
						width='16'
						height='16'
						rx='2'
						strokeWidth='1.5'
					/>
				</svg>
			);
	}
}
