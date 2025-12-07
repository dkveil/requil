import { Img } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import React from 'react';
import { generateAllStyles } from '../attributes';
import { replaceVariables } from '../utils/';

export type EmailImageProps = {
	block: BlockIR;
	className?: string;
	style?: React.CSSProperties;
	variables?: Record<string, string>;
};

export function EmailImage({
	block,
	className,
	style,
	variables,
	...rest
}: EmailImageProps) {
	const generatedStyles = generateAllStyles(block.props);

	const rawSrc = (block.props.src as string) || '';
	const src = variables ? replaceVariables(rawSrc, variables) : rawSrc;

	const rawAlt = (block.props.alt as string) || '';
	const alt = variables ? replaceVariables(rawAlt, variables) : rawAlt;

	const width = block.props.width as string | undefined;
	const height = block.props.height as string | undefined;

	if (!src) {
		return null;
	}

	return (
		<Img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={className}
			style={{
				display: 'block', // Default for emails to avoid gaps
				maxWidth: '100%',
				...generatedStyles,
				...style,
			}}
			{...rest}
		/>
	);
}
