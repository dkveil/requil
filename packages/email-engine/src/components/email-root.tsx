import { Container } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';

export type EmailRootProps = {
	block: BlockIR;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function EmailRoot({
	block,
	children,
	className,
	style,
}: EmailRootProps) {
	const generatedStyles = generateAllStyles(block.props);

	return (
		<Container
			className={className}
			style={{
				maxWidth: '600px',
				...generatedStyles,
				...style,
			}}
		>
			<Container>{children}</Container>
		</Container>
	);
}
