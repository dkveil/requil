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
			onChange={onChange}
			type='radius'
			max={max}
		/>
	);
}
