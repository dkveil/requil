import { Link, Square, Unlink } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface BoxValue {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

interface BoxControlProps {
	value: BoxValue | number;
	onChange: (value: BoxValue | number) => void;
	min?: number;
	max?: number;
	type?: 'padding' | 'radius';
}

export function BoxControl({
	value,
	onChange,
	min = 0,
	max,
	type = 'padding',
}: BoxControlProps) {
	const isLinked = typeof value === 'number';
	const [showIndividual, setShowIndividual] = useState(false);

	const boxValue: BoxValue =
		typeof value === 'number'
			? { top: value, right: value, bottom: value, left: value }
			: value;

	const handleLinkedChange = (newValue: number) => {
		onChange(newValue);
	};

	const handleIndividualChange = (side: keyof BoxValue, newValue: number) => {
		const newBox = { ...boxValue, [side]: newValue };
		onChange(newBox);
	};

	const toggleLink = () => {
		if (isLinked) {
			onChange({ ...boxValue });
		} else {
			onChange(boxValue.top);
		}
	};

	const labels =
		type === 'radius'
			? {
					top: 'TL',
					right: 'TR',
					bottom: 'BR',
					left: 'BL',
				}
			: {
					top: 'T',
					right: 'R',
					bottom: 'B',
					left: 'L',
				};

	return (
		<div className='space-y-2'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={toggleLink}
						className='p-1 hover:bg-accent rounded transition-colors'
						aria-label={isLinked ? 'Unlink sides' : 'Link sides'}
					>
						{isLinked ? (
							<Link className='h-3 w-3 text-muted-foreground' />
						) : (
							<Unlink className='h-3 w-3 text-muted-foreground' />
						)}
					</button>
					{!showIndividual && (
						<Input
							type='number'
							value={isLinked ? (value as number) : boxValue.top}
							onChange={(e) => {
								const newValue = Number(e.target.value);
								if (isLinked) {
									handleLinkedChange(newValue);
								} else {
									handleIndividualChange('top', newValue);
								}
							}}
							min={min}
							max={max}
							className='w-16 h-7 text-xs text-center bg-accent/50 border-accent'
						/>
					)}
				</div>
				<button
					type='button'
					onClick={() => setShowIndividual(!showIndividual)}
					className='p-1 hover:bg-accent rounded transition-colors'
					aria-label='Toggle individual controls'
				>
					<Square className='h-3 w-3 text-muted-foreground' />
				</button>
			</div>

			{showIndividual && (
				<div className='relative bg-accent/30 rounded-lg p-8 border border-accent'>
					<div className='absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5'>
						<span className='text-[9px] text-muted-foreground font-medium'>
							{labels.top}
						</span>
						<Input
							type='number'
							value={boxValue.top}
							onChange={(e) =>
								handleIndividualChange('top', Number(e.target.value))
							}
							className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
							min={min}
							max={max}
						/>
					</div>

					<div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-0.5'>
						<span className='text-[9px] text-muted-foreground font-medium'>
							{labels.bottom}
						</span>
						<Input
							type='number'
							value={boxValue.bottom}
							onChange={(e) =>
								handleIndividualChange('bottom', Number(e.target.value))
							}
							className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
							min={min}
							max={max}
						/>
					</div>

					<div className='absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5'>
						<span className='text-[9px] text-muted-foreground font-medium'>
							{labels.left}
						</span>
						<Input
							type='number'
							value={boxValue.left}
							onChange={(e) =>
								handleIndividualChange('left', Number(e.target.value))
							}
							className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
							min={min}
							max={max}
						/>
					</div>

					<div className='absolute right-2 top-1/2 -translate-y-1/2 flex flex-row-reverse items-center gap-0.5'>
						<span className='text-[9px] text-muted-foreground font-medium'>
							{labels.right}
						</span>
						<Input
							type='number'
							value={boxValue.right}
							onChange={(e) =>
								handleIndividualChange('right', Number(e.target.value))
							}
							className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
							min={min}
							max={max}
						/>
					</div>

					<div className='bg-background/50 rounded border border-dashed border-border h-16 flex items-center justify-center'>
						<span className='text-[10px] text-muted-foreground'>Content</span>
					</div>
				</div>
			)}
		</div>
	);
}
