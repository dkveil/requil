import { Heading } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';

export type EmailHeadingProps = {
	block: BlockIR;
	className?: string;
	ref?: (element: HTMLElement | null) => void;
	children?: React.ReactNode;
	canvasContent?: React.ReactNode;
	style?: React.CSSProperties;
};

export function EmailHeading({
	block,
	className,
	children,
	canvasContent,
	style,
	...rest
}: EmailHeadingProps) {
	const generatedStyles = generateAllStyles(block.props);
	const content = canvasContent || (block.props.content as string);
	const level = block.props.level as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

	return (
		<Heading
			className={className}
			as={level}
			style={{
				wordBreak: 'break-word',
				wordWrap: 'break-word',
				overflowWrap: 'anywhere',
				maxWidth: '100%',
				margin: 0,
				...generatedStyles,
				...style,
			}}
			{...rest}
		>
			{children || content}
		</Heading>
	);
}
