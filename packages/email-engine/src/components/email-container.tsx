import { Container } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';

export type EmailContainerProps = {
	block: BlockIR;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function EmailContainer({
	block,
	children,
	className,
	style,
}: EmailContainerProps) {
	const generatedStyles = generateAllStyles(block.props);

	return (
		<Container
			className={className}
			style={{
				...generatedStyles,
				...style,
			}}
		>
			{children}
		</Container>
	);
}
