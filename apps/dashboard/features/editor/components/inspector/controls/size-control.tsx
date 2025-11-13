import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const SIZE_CONTROL_REGEX = /^(\d+\.?\d*)(.*)$/;

interface SizeControlProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	units?: Array<{ label: string; value: string }>;
	placeholder?: string;
}

export function SizeControl({
	label,
	value,
	onChange,
	units = [
		{ label: '%', value: '%' },
		{ label: 'px', value: 'px' },
		{ label: 'Auto', value: 'auto' },
	],
	placeholder = '100',
}: SizeControlProps) {
	const parseValue = (val: string): { numeric: string; unit: string } => {
		if (!val || val === 'auto') return { numeric: '', unit: 'auto' };
		const match = val.match(SIZE_CONTROL_REGEX);
		if (match) {
			return { numeric: match[1] ?? '', unit: match[2] ?? 'px' };
		}
		return { numeric: '', unit: 'px' };
	};

	const { numeric, unit } = parseValue(value);

	const handleNumericChange = (newNumeric: string) => {
		if (unit === 'auto') {
			onChange(newNumeric ? `${newNumeric}px` : 'auto');
		} else {
			onChange(newNumeric ? `${newNumeric}${unit}` : '');
		}
	};

	const handleUnitChange = (newUnit: string) => {
		if (newUnit === 'auto') {
			onChange('auto');
		} else {
			onChange(numeric ? `${numeric}${newUnit}` : `0${newUnit}`);
		}
	};

	return (
		<div className='flex items-center justify-between gap-3'>
			<Label className='text-xs text-muted-foreground flex-shrink-0'>
				{label}
			</Label>
			<div className='flex items-center'>
				<Input
					type='text'
					value={unit === 'auto' ? 'auto' : numeric}
					onChange={(e) => handleNumericChange(e.target.value)}
					placeholder={placeholder}
					disabled={unit === 'auto'}
					className='w-20 h-7 text-xs text-center bg-accent/50 border-accent rounded-r-none border-r-0'
				/>
				<Select
					value={unit}
					onValueChange={handleUnitChange}
				>
					<SelectTrigger className='h-7 min-h-7 text-xs bg-accent/50 border-accent w-[60px] rounded-l-none px-2 py-0'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{units.map((u) => (
							<SelectItem
								key={u.value}
								value={u.value}
							>
								{u.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
