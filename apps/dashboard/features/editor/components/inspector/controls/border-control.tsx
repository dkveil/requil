import { Link, Square, Unlink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BorderSideValue {
	width?: number;
	color?: string;
	style?: string;
}

interface BorderValue {
	width?: number;
	color?: string;
	style?: string;
	top?: BorderSideValue | null;
	right?: BorderSideValue | null;
	bottom?: BorderSideValue | null;
	left?: BorderSideValue | null;
}

interface BorderControlProps {
	value: BorderValue | null;
	onChange: (value: BorderValue | null) => void;
	defaultExpanded?: boolean;
}

const BORDER_STYLES = [
	{ label: 'Solid', value: 'solid' },
	{ label: 'Dashed', value: 'dashed' },
	{ label: 'Dotted', value: 'dotted' },
	{ label: 'Double', value: 'double' },
];

const DEFAULT_BORDER: BorderSideValue = {
	width: 1,
	color: '#000000',
	style: 'solid',
};

function BorderSideInput({
	label,
	value,
	onChange,
	onRemove,
	isOverride = false,
}: {
	label: string;
	value: BorderSideValue | null | undefined;
	onChange: (value: BorderSideValue) => void;
	onRemove?: () => void;
	isOverride?: boolean;
}) {
	const isActive = value !== null && value !== undefined;
	const currentValue = value || DEFAULT_BORDER;

	if (!isActive && isOverride) {
		return (
			<div className='flex items-center justify-between'>
				<span className='text-[10px] text-muted-foreground font-medium'>
					{label}
				</span>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => onChange(DEFAULT_BORDER)}
					className='h-5 px-2 text-[10px]'
				>
					Override
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-1'>
			<div className='flex items-center justify-between'>
				<span className='text-[10px] text-muted-foreground font-medium'>
					{label}
				</span>
				{isOverride && onRemove && (
					<button
						type='button'
						onClick={onRemove}
						className='text-[10px] text-muted-foreground hover:text-foreground'
					>
						✕
					</button>
				)}
			</div>
			<div className='flex items-center gap-1'>
				<Input
					type='number'
					value={currentValue.width ?? 1}
					onChange={(e) =>
						onChange({ ...currentValue, width: Number(e.target.value) })
					}
					min={0}
					max={20}
					className='w-12 h-6 text-[10px] text-center bg-accent/50 border-accent'
					title='Width'
				/>
				<Input
					type='color'
					value={currentValue.color ?? '#000000'}
					onChange={(e) => onChange({ ...currentValue, color: e.target.value })}
					className='w-6 h-6 p-0.5 cursor-pointer bg-accent/50 border-accent'
					title='Color'
				/>
				<Select
					value={currentValue.style ?? 'solid'}
					onValueChange={(val) => onChange({ ...currentValue, style: val })}
				>
					<SelectTrigger className='h-6 text-[10px] bg-accent/50 border-accent w-16'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{BORDER_STYLES.map((opt) => (
							<SelectItem
								key={opt.value}
								value={opt.value}
							>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export function BorderControl({
	value,
	onChange,
	defaultExpanded = false,
}: BorderControlProps) {
	const [showIndividual, setShowIndividual] = useState(defaultExpanded);

	const hasBase =
		value?.width !== undefined ||
		value?.color !== undefined ||
		value?.style !== undefined;
	const hasSides =
		value?.top !== undefined ||
		value?.right !== undefined ||
		value?.bottom !== undefined ||
		value?.left !== undefined;

	const isLinked = hasBase && !hasSides;

	const baseValue: BorderSideValue = {
		width: value?.width ?? 1,
		color: value?.color ?? '#000000',
		style: value?.style ?? 'solid',
	};

	const handleBaseChange = (newBase: BorderSideValue) => {
		onChange({
			...value,
			width: newBase.width,
			color: newBase.color,
			style: newBase.style,
		});
	};

	const handleSideChange = (
		side: 'top' | 'right' | 'bottom' | 'left',
		sideValue: BorderSideValue | null
	) => {
		onChange({
			...value,
			[side]: sideValue,
		});
	};

	const toggleLink = () => {
		if (isLinked) {
			onChange({
				...value,
				top: baseValue,
				right: baseValue,
				bottom: baseValue,
				left: baseValue,
			});
		} else {
			const { top, right, bottom, left, ...rest } = value || {};
			const firstSide = top || right || bottom || left || baseValue;
			onChange({
				width: firstSide.width,
				color: firstSide.color,
				style: firstSide.style,
			});
		}
	};

	const labels = {
		top: 'Top',
		right: 'Right',
		bottom: 'Bottom',
		left: 'Left',
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
					>
						{isLinked ? (
							<Link className='h-3.5 w-3.5 text-foreground' />
						) : (
							<Unlink className='h-3.5 w-3.5 text-muted-foreground' />
						)}
					</button>

					{!showIndividual && (
						<div className='flex items-center gap-1'>
							<Input
								type='number'
								value={baseValue.width ?? 1}
								onChange={(e) =>
									handleBaseChange({
										...baseValue,
										width: Number(e.target.value),
									})
								}
								min={0}
								max={20}
								className='w-14 h-7 text-xs text-center bg-accent/50 border-accent'
								title='Width'
							/>
							<Input
								type='color'
								value={baseValue.color ?? '#000000'}
								onChange={(e) =>
									handleBaseChange({ ...baseValue, color: e.target.value })
								}
								className='w-8 h-7 p-0.5 cursor-pointer bg-accent/50 border-accent'
								title='Color'
							/>
							<Select
								value={baseValue.style ?? 'solid'}
								onValueChange={(val) =>
									handleBaseChange({ ...baseValue, style: val })
								}
							>
								<SelectTrigger className='h-7 text-xs bg-accent/50 border-accent w-20'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{BORDER_STYLES.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
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
				>
					<Square className='h-3.5 w-3.5' />
				</button>
			</div>

			{showIndividual && (
				<div className='relative bg-accent/30 rounded-lg p-3 border border-accent'>
					<div className='space-y-3'>
						<div className='pb-2 border-b border-accent'>
							<span className='text-[10px] text-muted-foreground font-medium mb-1 block'>
								Base (all sides)
							</span>
							<div className='flex items-center gap-1'>
								<Input
									type='number'
									value={baseValue.width ?? 1}
									onChange={(e) =>
										handleBaseChange({
											...baseValue,
											width: Number(e.target.value),
										})
									}
									min={0}
									max={20}
									className='w-14 h-6 text-[10px] text-center bg-accent/50 border-accent'
								/>
								<Input
									type='color'
									value={baseValue.color ?? '#000000'}
									onChange={(e) =>
										handleBaseChange({ ...baseValue, color: e.target.value })
									}
									className='w-6 h-6 p-0.5 cursor-pointer bg-accent/50 border-accent'
								/>
								<Select
									value={baseValue.style ?? 'solid'}
									onValueChange={(val) =>
										handleBaseChange({ ...baseValue, style: val })
									}
								>
									<SelectTrigger className='h-6 text-[10px] bg-accent/50 border-accent w-16'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{BORDER_STYLES.map((opt) => (
											<SelectItem
												key={opt.value}
												value={opt.value}
											>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className='space-y-2'>
							<span className='text-[10px] text-muted-foreground font-medium'>
								Overrides
							</span>
							{(['top', 'right', 'bottom', 'left'] as const).map((side) => (
								<BorderSideInput
									key={side}
									label={labels[side]}
									value={value?.[side]}
									onChange={(val) => handleSideChange(side, val)}
									onRemove={() => handleSideChange(side, null)}
									isOverride
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
