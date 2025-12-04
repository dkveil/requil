import { BoxControl } from './box-control';

interface RadiusValue {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

interface RadiusControlProps {
	value: RadiusValue | number;
	onChange: (value: RadiusValue | number) => void;
	max?: number;
}

export function RadiusControl({
	value,
	onChange,
	max = 50,
}: RadiusControlProps) {
	return (
		<BoxControl
			value={value}
			onChange={(value) => onChange(value as RadiusValue | number)}
			type='radius'
			max={max}
		/>
	);
}
