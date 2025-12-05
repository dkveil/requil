import { Heading } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { replaceVariables } from '../utils/';

export type EmailHeadingProps = {
	block: BlockIR;
	className?: string;
	ref?: (element: HTMLElement | null) => void;
	children?: React.ReactNode;
	canvasContent?: React.ReactNode;
	style?: React.CSSProperties;
	variables?: Record<string, string>;
};

export function EmailHeading({
	block,
	className,
	children,
	canvasContent,
	style,
	variables,
	...rest
}: EmailHeadingProps) {
	const generatedStyles = generateAllStyles(block.props);
	const rawContent = canvasContent || (block.props.content as string);
	const content = variables
		? replaceVariables(rawContent as string, variables)
		: rawContent;
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
