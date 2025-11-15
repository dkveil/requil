import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { isFieldVisible } from '../../lib/field-utils';
import { ArrayControl } from './controls/array-control';
import { IconSelect } from './controls/icon-select';
import { PaddingControl } from './controls/padding-control';
import { RadiusControl } from './controls/radius-control';
import { SizeControl } from './controls/size-control';

interface PropertyControlProps {
	field: {
		key: string;
		label: string;
		type: string;
		min?: number;
		max?: number;
		step?: number;
		rows?: number;
		placeholder?: string;
		options?: Array<{ label: string; value: unknown }>;
		children?: PropertyControlProps['field'][];
		isCollapsible?: boolean;
		isExpanded?: boolean;
		isAddable?: boolean;
		emptyLabel?: string;
		defaultExpanded?: boolean;
		condition?: {
			field: string;
			operator: string;
			value?: unknown;
		};
	};
	value: unknown;
	onChange: (value: unknown) => void;
	allValues?: Record<string, any>;
}

export function PropertyControl({
	field,
	value,
	onChange,
	allValues,
}: PropertyControlProps) {
	const [isExpanded, setIsExpanded] = useState(field.isExpanded ?? true);

	switch (field.type) {
		case 'color':
			return (
				<div className='flex items-center justify-between gap-3'>
					<Label className='text-xs text-muted-foreground flex-shrink-0'>
						{field.label}
					</Label>
					<div className='flex items-center gap-2'>
						<Input
							type='color'
							value={value as string}
							onChange={(e) => onChange(e.target.value)}
							className='w-8 h-7 p-0.5 cursor-pointer bg-accent/50 border-accent'
						/>
						<Input
							type='text'
							value={value as string}
							onChange={(e) => onChange(e.target.value)}
							className='w-24 h-7 text-xs font-mono bg-accent/50 border-accent'
						/>
					</div>
				</div>
			);

		case 'number':
			return (
				<div className='flex items-center justify-between gap-3'>
					<Label className='text-xs text-muted-foreground flex-shrink-0'>
						{field.label}
					</Label>
					<Input
						type='number'
						value={value as number}
						onChange={(e) => onChange(Number(e.target.value))}
						min={field.min}
						max={field.max}
						step={field.step}
						className='h-7 text-xs w-20 text-center bg-accent/50 border-accent'
					/>
				</div>
			);

		case 'slider':
			return (
				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<Label className='text-xs text-muted-foreground'>
							{field.label}
						</Label>
						<span className='text-xs text-foreground font-medium'>
							{value as number}
						</span>
					</div>
					<input
						type='range'
						value={value as number}
						onChange={(e) => onChange(Number(e.target.value))}
						min={field.min}
						max={field.max}
						step={field.step}
						className='w-full h-1 bg-accent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0'
					/>
				</div>
			);

		case 'toggle':
			return (
				<div className='flex items-center justify-between'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<div className='flex items-center gap-1 bg-accent/50 rounded-md p-0.5'>
						<button
							type='button'
							onClick={() => onChange(true)}
							className={cn(
								'px-3 py-1 text-xs rounded transition-colors',
								value === true
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							Yes
						</button>
						<button
							type='button'
							onClick={() => onChange(false)}
							className={cn(
								'px-3 py-1 text-xs rounded transition-colors',
								value === false
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							No
						</button>
					</div>
				</div>
			);

		case 'select': {
			const isNumeric = typeof field.options?.[0]?.value === 'number';

			return (
				<div className='flex items-center justify-between gap-3'>
					<Label className='text-xs text-muted-foreground flex-shrink-0'>
						{field.label}
					</Label>
					<Select
						value={String(value)}
						onValueChange={(val) => {
							const convertedValue = isNumeric ? Number(val) : val;
							onChange(convertedValue);
						}}
					>
						<SelectTrigger className='h-7 text-xs bg-accent/50 border-accent w-[120px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{field.options?.map((option) => (
								<SelectItem
									key={String(option.value)}
									value={String(option.value)}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);
		}

		case 'htmlTag': {
			const hasLink = allValues?.linkTo !== null;

			const displayValue = hasLink ? 'a' : String(value);
			const optionsWithLink = hasLink
				? [
						{
							label: 'a',
							value: 'a',
							disabled: true as boolean | undefined,
						},
						...(field.options || []),
					]
				: field.options;

			return (
				<div className='flex items-center justify-between gap-3'>
					<Label className='text-xs text-muted-foreground flex-shrink-0'>
						{field.label}
					</Label>
					<Select
						value={displayValue}
						onValueChange={(val) => {
							onChange(val);
						}}
						disabled={hasLink}
					>
						<SelectTrigger className='h-7 text-xs bg-accent/50 border-accent w-[120px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{optionsWithLink?.map((option) => (
								<SelectItem
									key={String(option.value)}
									value={String(option.value)}
									disabled={'disabled' in option ? option.disabled : undefined}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);
		}

		case 'iconSelect':
			return (
				<IconSelect
					label={field.label}
					value={String(value)}
					onChange={onChange}
					options={
						field.options?.map((opt) => ({
							label: opt.label,
							value: String(opt.value),
							icon: (opt as { icon?: string }).icon || opt.label,
						})) || []
					}
				/>
			);

		case 'text':
		// TODO: Add image control
		case 'image':
			return (
				<div className='flex items-center justify-between gap-3'>
					<Label className='text-xs text-muted-foreground flex-shrink-0'>
						{field.label}
					</Label>
					<Input
						type='text'
						value={String(value)}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.placeholder}
						className='h-7 text-xs flex-1 bg-accent/50 border-accent'
					/>
				</div>
			);

		case 'textarea':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<Textarea
						value={String(value)}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.placeholder}
						className='h-24 text-xs'
						rows={field.rows}
					/>
				</div>
			);

		case 'padding':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<PaddingControl
						value={value as any}
						onChange={onChange}
						defaultExpanded={field.defaultExpanded}
					/>
				</div>
			);

		case 'radius':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<RadiusControl
						value={value as any}
						onChange={onChange}
						max={field.max}
					/>
				</div>
			);

		case 'size':
			return (
				<SizeControl
					label={field.label}
					value={String(value || '')}
					onChange={onChange}
					units={field.options?.map((opt) => ({
						label: opt.label,
						value: String(opt.value),
					}))}
					placeholder={field.placeholder}
				/>
			);

		case 'group': {
			const isEmpty =
				!value ||
				value === null ||
				Object.keys((value as Record<string, any>) || {}).length === 0;
			const isActive = field.isAddable && !isEmpty;

			if (field.isAddable && isEmpty) {
				return (
					<div className='flex items-center justify-between'>
						<Label className='text-xs text-muted-foreground'>
							{field.label}
						</Label>
						<button
							type='button'
							onClick={() => {
								const defaultValue: Record<string, any> = {};
								field.children?.forEach((child: any) => {
									if (child.type === 'color') {
										defaultValue[child.key] = '#FFFFFF';
									} else if (
										child.type === 'number' ||
										child.type === 'slider'
									) {
										defaultValue[child.key] = child.min || 0;
									} else if (child.type === 'select' && child.options?.[0]) {
										defaultValue[child.key] = child.options[0].value;
									} else if (child.type === 'toggle') {
										defaultValue[child.key] = child.defaultValue ?? false;
									} else {
										defaultValue[child.key] = '';
									}
								});
								onChange(defaultValue);
							}}
							className='px-3 py-1 text-xs bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors rounded border border-accent'
						>
							{field.emptyLabel || 'Add...'}
						</button>
					</div>
				);
			}

			return (
				<div className='space-y-2'>
					<div
						className={cn(
							'flex items-center justify-between py-1',
							field.isCollapsible &&
								'cursor-pointer hover:bg-accent/50 rounded transition-colors'
						)}
					>
						<Label className='text-xs font-semibold text-foreground'>
							{field.label}
						</Label>
						<div className='flex items-center gap-2'>
							{field.isAddable && isActive && (
								<button
									type='button'
									onClick={() => onChange(null)}
									className='text-xs text-muted-foreground hover:text-foreground transition-colors'
									aria-label='Remove'
								>
									✕
								</button>
							)}
							{field.isCollapsible && (
								<button
									type='button'
									onClick={() => setIsExpanded(!isExpanded)}
									aria-label={isExpanded ? 'Collapse' : 'Expand'}
								>
									<ChevronDown
										className={cn(
											'h-3 w-3 text-muted-foreground transition-transform',
											isExpanded && 'rotate-180'
										)}
									/>
								</button>
							)}
						</div>
					</div>

					{(isExpanded || !field.isCollapsible) && field.children && (
						<div className='border-border space-y-3'>
							{field.children
								.filter((childField: any) =>
									isFieldVisible(childField, allValues || {})
								)
								.map((childField: any) => {
									const childValue = (value as Record<string, any>)?.[
										childField.key
									];

									return (
										<PropertyControl
											key={childField.key}
											field={childField}
											value={childValue}
											onChange={(newValue) => {
												onChange({
													...(value as Record<string, any>),
													[childField.key]: newValue,
												});
											}}
											allValues={allValues}
										/>
									);
								})}
						</div>
					)}
				</div>
			);
		}

		case 'array':
			return (
				<ArrayControl
					field={field}
					value={value}
					onChange={onChange}
					renderField={(
						childField,
						childValue,
						childOnChange,
						childAllValues
					) => (
						<PropertyControl
							key={childField.key}
							field={childField}
							value={childValue}
							onChange={childOnChange}
							allValues={childAllValues}
						/>
					)}
				/>
			);

		default:
			return null;
	}
}
