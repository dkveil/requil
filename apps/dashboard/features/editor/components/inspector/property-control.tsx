import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface PropertyControlProps {
	field: {
		key: string;
		label: string;
		type: string;
		min?: number;
		max?: number;
		step?: number;
		placeholder?: string;
		options?: Array<{ label: string; value: unknown }>;
	};
	value: unknown;
	onChange: (value: unknown) => void;
}

export function PropertyControl({
	field,
	value,
	onChange,
}: PropertyControlProps) {
	switch (field.type) {
		case 'color':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<div className='flex items-center gap-2'>
						<Input
							type='color'
							value={value as string}
							onChange={(e) => onChange(e.target.value)}
							className='w-12 h-8 p-1 cursor-pointer'
						/>
						<Input
							type='text'
							value={value as string}
							onChange={(e) => onChange(e.target.value)}
							className='flex-1 h-8 text-xs font-mono'
						/>
					</div>
				</div>
			);

		case 'number':
		case 'slider':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<Input
						type='number'
						value={value as number}
						onChange={(e) => onChange(Number(e.target.value))}
						min={field.min}
						max={field.max}
						step={field.step}
						className='h-8 text-xs'
					/>
				</div>
			);

		case 'toggle':
			return (
				<div className='flex items-center justify-between'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<input
						type='checkbox'
						checked={value as boolean}
						onChange={(e) => onChange(e.target.checked)}
						className='w-4 h-4'
					/>
				</div>
			);

		case 'select':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<Select
						value={String(value)}
						onValueChange={(val) => onChange(val)}
					>
						<SelectTrigger className='h-8 text-xs'>
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

		case 'text':
			return (
				<div className='space-y-2'>
					<Label className='text-xs text-muted-foreground'>{field.label}</Label>
					<Input
						type='text'
						value={String(value)}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.placeholder}
						className='h-8 text-xs'
					/>
				</div>
			);

		default:
			return null;
	}
}
