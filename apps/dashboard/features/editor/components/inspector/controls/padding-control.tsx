import { BoxControl } from './box-control';

interface SpacingValue {
	top: number | 'auto';
	right: number | 'auto';
	bottom: number | 'auto';
	left: number | 'auto';
}

interface PaddingControlProps {
	value: SpacingValue | number | 'auto';
	onChange: (value: SpacingValue | number | 'auto') => void;
	defaultExpanded?: boolean;
	type?: 'padding' | 'margin';
	allowAuto?: boolean;
}

export function PaddingControl({
	value,
	onChange,
	defaultExpanded,
	type = 'padding',
	allowAuto = false,
}: PaddingControlProps) {
	return (
		<BoxControl
			value={value}
			onChange={onChange}
			type={type}
			defaultExpanded={defaultExpanded}
			allowAuto={allowAuto}
		/>
	);
}
