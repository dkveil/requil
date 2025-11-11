import { Input } from '@/components/ui/input';

interface SpacingEditorProps {
	paddingTop: number;
	paddingBottom: number;
	paddingLeft: number;
	paddingRight: number;
	onPaddingChange: (
		side: 'Top' | 'Bottom' | 'Left' | 'Right',
		value: number
	) => void;
}

export function SpacingEditor({
	paddingTop,
	paddingBottom,
	paddingLeft,
	paddingRight,
	onPaddingChange,
}: SpacingEditorProps) {
	return (
		<div className='space-y-4'>
			{/* Visual Padding Editor */}
			<div className='relative bg-muted rounded-lg p-8'>
				{/* Top */}
				<div className='absolute top-2 left-1/2 -translate-x-1/2'>
					<Input
						type='number'
						value={paddingTop}
						onChange={(e) => onPaddingChange('Top', Number(e.target.value))}
						className='w-16 h-7 text-xs text-center'
						min={0}
					/>
				</div>

				{/* Bottom */}
				<div className='absolute bottom-2 left-1/2 -translate-x-1/2'>
					<Input
						type='number'
						value={paddingBottom}
						onChange={(e) => onPaddingChange('Bottom', Number(e.target.value))}
						className='w-16 h-7 text-xs text-center'
						min={0}
					/>
				</div>

				{/* Left */}
				<div className='absolute left-2 top-1/2 -translate-y-1/2'>
					<Input
						type='number'
						value={paddingLeft}
						onChange={(e) => onPaddingChange('Left', Number(e.target.value))}
						className='w-16 h-7 text-xs text-center'
						min={0}
					/>
				</div>

				{/* Right */}
				<div className='absolute right-2 top-1/2 -translate-y-1/2'>
					<Input
						type='number'
						value={paddingRight}
						onChange={(e) => onPaddingChange('Right', Number(e.target.value))}
						className='w-16 h-7 text-xs text-center'
						min={0}
					/>
				</div>

				{/* Center Box */}
				<div className='bg-background rounded border-2 border-dashed border-border h-24 flex items-center justify-center'>
					<span className='text-xs text-muted-foreground'>Content</span>
				</div>
			</div>

			{/* Labels */}
			<div className='grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
				<div>Padding</div>
			</div>
		</div>
	);
}
