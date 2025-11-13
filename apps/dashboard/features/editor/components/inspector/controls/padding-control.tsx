import { BoxControl } from './box-control';

interface PaddingValue {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

interface PaddingControlProps {
	value: PaddingValue | number;
	onChange: (value: PaddingValue | number) => void;
}

export function PaddingControl({ value, onChange }: PaddingControlProps) {
	return (
		<BoxControl
			value={value}
			onChange={onChange}
			type='padding'
		/>
	);
}
