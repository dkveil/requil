import { Link, Square, Unlink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type BoxSideValue = number | 'auto';

interface BoxValue {
	top: BoxSideValue;
	right: BoxSideValue;
	bottom: BoxSideValue;
	left: BoxSideValue;
}

interface BoxControlProps {
	value: BoxValue | number | 'auto';
	onChange: (value: BoxValue | number | 'auto') => void;
	min?: number;
	max?: number;
	type?: 'padding' | 'radius' | 'margin';
	defaultExpanded?: boolean;
	allowAuto?: boolean;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: UI control with multiple visual states
export function BoxControl({
	value,
	onChange,
	min = 0,
	max,
	type = 'padding',
	defaultExpanded = false,
	allowAuto = false,
}: BoxControlProps) {
	const isLinked = typeof value === 'number' || value === 'auto';
	const [showIndividual, setShowIndividual] = useState(defaultExpanded);

	const boxValue: BoxValue =
		typeof value === 'number'
			? { top: value, right: value, bottom: value, left: value }
			: value === 'auto'
				? { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' }
				: value;

	const handleLinkedChange = (newValue: number | 'auto') => {
		onChange(newValue);
	};

	const handleIndividualChange = (
		side: keyof BoxValue,
		newValue: BoxSideValue
	) => {
		const newBox = { ...boxValue, [side]: newValue };
		onChange(newBox);
	};

	const toggleLink = () => {
		if (isLinked) {
			onChange({ ...boxValue });
		} else {
			const firstValue = boxValue.top;
			onChange(firstValue);
		}
	};

	const toggleAuto = (side?: keyof BoxValue) => {
		if (side) {
			const currentValue = boxValue[side];
			const newValue: BoxSideValue = currentValue === 'auto' ? 0 : 'auto';
			handleIndividualChange(side, newValue);
		} else {
			const newValue = value === 'auto' ? 0 : 'auto';
			handleLinkedChange(newValue);
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
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={toggleLink}
						className='flex items-center justify-center w-7 h-7 hover:bg-accent rounded transition-colors shrink-0'
						title={isLinked ? 'Unlink sides' : 'Link sides'}
						aria-label={isLinked ? 'Unlink sides' : 'Link sides'}
					>
						{isLinked ? (
							<Link className='h-3.5 w-3.5 text-foreground' />
						) : (
							<Unlink className='h-3.5 w-3.5 text-muted-foreground' />
						)}
					</button>

					{!showIndividual &&
						(value === 'auto' || (isLinked && allowAuto) ? (
							<div className='flex items-center gap-1'>
								<Input
									type='text'
									value={value === 'auto' ? 'auto' : (value as number)}
									onChange={(e) => {
										const val = e.target.value;
										if (val === 'auto' && allowAuto) {
											handleLinkedChange('auto');
										} else {
											const numVal = Number(val);
											if (!Number.isNaN(numVal)) {
												handleLinkedChange(numVal);
											}
										}
									}}
									min={min}
									max={max}
									className='w-16 h-7 text-xs text-center bg-accent/50 border-accent'
									readOnly={value === 'auto'}
								/>
								{allowAuto && (
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => toggleAuto()}
										className='h-7 px-2 text-xs shrink-0'
									>
										{value === 'auto' ? 'Set' : 'Auto'}
									</Button>
								)}
							</div>
						) : (
							<Input
								type='number'
								value={isLinked ? (value as number) : (boxValue.top as number)}
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
						))}
				</div>

				<button
					type='button'
					onClick={() => setShowIndividual(!showIndividual)}
					className={cn(
						'flex items-center justify-center w-7 h-7 rounded transition-all shrink-0',
						showIndividual
							? 'bg-primary text-primary-foreground hover:bg-primary/90'
							: 'hover:bg-accent'
					)}
					title='Toggle individual controls'
					aria-label='Toggle individual controls'
				>
					<Square className='h-3.5 w-3.5' />
				</button>
			</div>

			{showIndividual && (
				<div className='relative bg-accent/30 rounded-lg p-10 border border-accent'>
					{type === 'radius' ? (
						<>
							{/* Top-left corner */}
							<div className='absolute top-2 left-2 flex flex-col items-center gap-1'>
								<span className='text-[10px] text-muted-foreground font-medium'>
									{labels.top}
								</span>
								<Input
									type='number'
									value={boxValue.top}
									onChange={(e) =>
										handleIndividualChange('top', Number(e.target.value))
									}
									className='w-16 h-7 text-xs text-center bg-accent/50 border-accent'
									min={min}
									max={max}
								/>
							</div>

							{/* Top-right corner */}
							<div className='absolute top-2 right-2 flex flex-col items-center gap-1'>
								<span className='text-[10px] text-muted-foreground font-medium'>
									{labels.right}
								</span>
								<Input
									type='number'
									value={boxValue.right}
									onChange={(e) =>
										handleIndividualChange('right', Number(e.target.value))
									}
									className='w-16 h-7 text-xs text-center bg-accent/50 border-accent'
									min={min}
									max={max}
								/>
							</div>

							{/* Bottom-left corner */}
							<div className='absolute bottom-2 left-2 flex flex-col-reverse items-center gap-1'>
								<span className='text-[10px] text-muted-foreground font-medium'>
									{labels.left}
								</span>
								<Input
									type='number'
									value={boxValue.left}
									onChange={(e) =>
										handleIndividualChange('left', Number(e.target.value))
									}
									className='w-16 h-7 text-xs text-center bg-accent/50 border-accent'
									min={min}
									max={max}
								/>
							</div>

							{/* Bottom-right corner */}
							<div className='absolute bottom-2 right-2 flex flex-col-reverse items-center gap-1'>
								<span className='text-[10px] text-muted-foreground font-medium'>
									{labels.bottom}
								</span>
								<Input
									type='number'
									value={boxValue.bottom}
									onChange={(e) =>
										handleIndividualChange('bottom', Number(e.target.value))
									}
									className='w-16 h-7 text-xs text-center bg-accent/50 border-accent'
									min={min}
									max={max}
								/>
							</div>
						</>
					) : (
						<>
							{/* Top - padding/margin */}
							<div className='absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5'>
								<span className='text-[9px] text-muted-foreground font-medium'>
									{labels.top}
								</span>
								<div className='flex items-center gap-0.5'>
									<Input
										type={boxValue.top === 'auto' ? 'text' : 'number'}
										value={boxValue.top}
										onChange={(e) => {
											const val = e.target.value;
											if (val === 'auto' && allowAuto) {
												handleIndividualChange('top', 'auto');
											} else {
												const numVal = Number(val);
												if (!Number.isNaN(numVal)) {
													handleIndividualChange('top', numVal);
												}
											}
										}}
										className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
										min={min}
										max={max}
										readOnly={boxValue.top === 'auto'}
									/>
									{allowAuto && (
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => toggleAuto('top')}
											className='h-6 px-1 text-[9px]'
										>
											{boxValue.top === 'auto' ? 'Set' : 'A'}
										</Button>
									)}
								</div>
							</div>

							{/* Bottom - padding/margin */}
							<div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-0.5'>
								<span className='text-[9px] text-muted-foreground font-medium'>
									{labels.bottom}
								</span>
								<div className='flex items-center gap-0.5'>
									<Input
										type={boxValue.bottom === 'auto' ? 'text' : 'number'}
										value={boxValue.bottom}
										onChange={(e) => {
											const val = e.target.value;
											if (val === 'auto' && allowAuto) {
												handleIndividualChange('bottom', 'auto');
											} else {
												const numVal = Number(val);
												if (!Number.isNaN(numVal)) {
													handleIndividualChange('bottom', numVal);
												}
											}
										}}
										className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
										min={min}
										max={max}
										readOnly={boxValue.bottom === 'auto'}
									/>
									{allowAuto && (
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => toggleAuto('bottom')}
											className='h-6 px-1 text-[9px]'
										>
											{boxValue.bottom === 'auto' ? 'Set' : 'A'}
										</Button>
									)}
								</div>
							</div>

							{/* Left - padding/margin */}
							<div className='absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5'>
								<span className='text-[9px] text-muted-foreground font-medium'>
									{labels.left}
								</span>
								<div className='flex items-center gap-0.5'>
									<Input
										type={boxValue.left === 'auto' ? 'text' : 'number'}
										value={boxValue.left}
										onChange={(e) => {
											const val = e.target.value;
											if (val === 'auto' && allowAuto) {
												handleIndividualChange('left', 'auto');
											} else {
												const numVal = Number(val);
												if (!Number.isNaN(numVal)) {
													handleIndividualChange('left', numVal);
												}
											}
										}}
										className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
										min={min}
										max={max}
										readOnly={boxValue.left === 'auto'}
									/>
									{allowAuto && (
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => toggleAuto('left')}
											className='h-6 px-1 text-[9px]'
										>
											{boxValue.left === 'auto' ? 'Set' : 'A'}
										</Button>
									)}
								</div>
							</div>

							{/* Right - padding/margin */}
							<div className='absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5'>
								<span className='text-[9px] text-muted-foreground font-medium'>
									{labels.right}
								</span>
								<div className='flex items-center gap-0.5'>
									<Input
										type={boxValue.right === 'auto' ? 'text' : 'number'}
										value={boxValue.right}
										onChange={(e) => {
											const val = e.target.value;
											if (val === 'auto' && allowAuto) {
												handleIndividualChange('right', 'auto');
											} else {
												const numVal = Number(val);
												if (!Number.isNaN(numVal)) {
													handleIndividualChange('right', numVal);
												}
											}
										}}
										className='w-14 h-6 text-xs text-center bg-accent/50 border-accent'
										min={min}
										max={max}
										readOnly={boxValue.right === 'auto'}
									/>
									{allowAuto && (
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => toggleAuto('right')}
											className='h-6 px-1 text-[9px]'
										>
											{boxValue.right === 'auto' ? 'Set' : 'A'}
										</Button>
									)}
								</div>
							</div>
						</>
					)}

					<div className='bg-background/50 rounded border border-dashed border-border h-16 flex items-center justify-center'>
						<span className='text-[10px] text-muted-foreground'>Content</span>
					</div>
				</div>
			)}
		</div>
	);
}
