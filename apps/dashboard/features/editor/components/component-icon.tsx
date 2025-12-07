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
						x='3'
						y='3'
						width='18'
						height='18'
						rx='2'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Section':
		case 'Block':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Section icon'}</title>
					<rect
						width='18'
						height='18'
						x='3'
						y='3'
						rx='2'
						strokeWidth='1.5'
					/>
					<path
						d='M12 3v18'
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
						d='M4 7V4h16v3'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M9 20h6'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M12 4v16'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
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
						d='M6 12h12'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M6 20V4'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M18 20V4'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
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
					<path
						d='m9 9 5 12 1.774-5.226L21 14 9 9z'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='m16.071 16.071 4.243 4.243'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
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
						width='18'
						height='18'
						x='3'
						y='3'
						rx='2'
						ry='2'
						strokeWidth='1.5'
					/>
					<circle
						cx='9'
						cy='9'
						r='2'
						strokeWidth='1.5'
					/>
					<path
						d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			);
		case 'List':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'List icon'}</title>
					<line
						x1='8'
						x2='21'
						y1='6'
						y2='6'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line
						x1='8'
						x2='21'
						y1='12'
						y2='12'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line
						x1='8'
						x2='21'
						y1='18'
						y2='18'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line
						x1='3'
						x2='3.01'
						y1='6'
						y2='6'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line
						x1='3'
						x2='3.01'
						y1='12'
						y2='12'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<line
						x1='3'
						x2='3.01'
						y1='18'
						y2='18'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			);
		case 'Quote':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Quote icon'}</title>
					<path
						d='M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			);
		case 'Link':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Link icon'}</title>
					<path
						d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			);
		case 'Root':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Root icon'}</title>
					<rect
						width='20'
						height='16'
						x='2'
						y='4'
						rx='2'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			);
		case 'SocialIcons':
			return (
				<svg
					className={cn('w-6 h-6', className)}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>{title || 'Social Icons'}</title>
					<circle
						cx='7'
						cy='12'
						r='3'
						strokeWidth='1.5'
					/>
					<circle
						cx='17'
						cy='12'
						r='3'
						strokeWidth='1.5'
					/>
					<path
						d='M7 9V6M17 9V6M7 15v3M17 15v3'
						strokeWidth='1.5'
						strokeLinecap='round'
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
