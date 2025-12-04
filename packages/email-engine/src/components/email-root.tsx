import { Body } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';

export type EmailRootProps = {
	block: BlockIR;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	isCanvas?: boolean;
};

export function EmailRoot({
	block,
	children,
	className,
	style,
	isCanvas = false,
}: EmailRootProps) {
	const generatedStyles = generateAllStyles(block.props);

	const BodyTag = isCanvas ? 'div' : Body;

	return (
		<BodyTag
			className={className}
			style={{
				...generatedStyles,
				...style,
			}}
		>
			{children}
		</BodyTag>
	);
}
