import { Hr } from '@react-email/components';
import { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';

export type EmailDividerProps = {
	block: BlockIR;
};

export const EmailDivider = ({ block }: EmailDividerProps) => {
	const generatedStyles = generateAllStyles(block.props);

	return (
		<Hr
			style={{
				width: '100%',
				border: 'none',
				...generatedStyles,
			}}
		/>
	);
};
