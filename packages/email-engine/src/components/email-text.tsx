import { Link, Text } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import React from 'react';
import { generateAllStyles } from '../attributes';
import { replaceVariables } from '../utils/';

export type EmailTextProps = {
	block: BlockIR;
	className?: string;
	ref?: (element: HTMLElement | null) => void;
	children?: React.ReactNode;
	canvasContent?: React.ReactNode;
	style?: React.CSSProperties;
	variables?: Record<string, string>;
};

const HTML_REGEX = /<[a-z][\s\S]*>/i;

export function EmailText({
	block,
	className,
	children,
	canvasContent,
	style,
	variables,
	...rest
}: EmailTextProps) {
	const generatedStyles = generateAllStyles(block.props);
	const rawContent = canvasContent || (block.props.content as string);
	const content = variables
		? replaceVariables(rawContent as string, variables)
		: rawContent;

	const renderContent = () => {
		if (children) return children;

		if (typeof content === 'string') {
			const hasHtml = HTML_REGEX.test(content);
			if (hasHtml) {
				return <span dangerouslySetInnerHTML={{ __html: content }} />;
			}
		}

		return content;
	};

	return (
		<Text
			className={className}
			style={{
				fontSize: '16px',
				lineHeight: '24px',
				margin: '16px 0',
				...generatedStyles,
				...style,
			}}
			{...rest}
		>
			{renderContent()}
		</Text>
	);
}
