// Icon component for each block type
export function ComponentIcon({ type }: { type: string }) {
	switch (type) {
		case 'Container':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Container icon</title>
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
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Section icon</title>
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
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Columns icon</title>
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
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Column icon</title>
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
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Spacer icon</title>
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
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Divider icon</title>
					<line
						x1='4'
						y1='12'
						x2='20'
						y2='12'
						strokeWidth='2'
					/>
				</svg>
			);
		default:
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Component icon</title>
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
