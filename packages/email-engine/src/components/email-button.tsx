import { Button, Section } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import React from 'react';
import { generateAllStyles } from '../attributes';
import { replaceVariables } from '../utils';

export type EmailButtonProps = {
	block: BlockIR;
	className?: string;
	children?: React.ReactNode;
	canvasContent?: React.ReactNode;
	style?: React.CSSProperties;
	variables?: Record<string, string>;
};

export function EmailButton({
	block,
	className,
	children,
	canvasContent,
	style,
	variables,
	...rest
}: EmailButtonProps) {
	const generatedStyles = generateAllStyles(block.props);

	const rawContent = canvasContent || (block.props.content as string);
	const content = variables
		? replaceVariables(rawContent as string, variables)
		: rawContent;

	const rawHref = (block.props.href as string) || '#';
	const href = variables ? replaceVariables(rawHref, variables) : rawHref;

	const rawTarget = (block.props.target as string) || '_blank';

	return (
		<Section style={{ width: '100%', textAlign: block.props.textAlign as any }}>
			<Button
				href={href}
				target={rawTarget}
				className={className}
				style={{
					...generatedStyles,
					...style,
				}}
				{...rest}
			>
				{children || content}
			</Button>
		</Section>
	);
}
