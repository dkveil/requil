import { Section } from '@react-email/components';
import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';

export type EmailSectionProps = {
	block: BlockIR;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function EmailSection({
	block,
	children,
	className,
	style,
}: EmailSectionProps) {
	const generatedStyles = generateAllStyles(block.props);

	const { minHeight, padding, ...restStyles } = generatedStyles as {
		minHeight?: string | number;
		[key: string]: string | number | undefined;
	};

	return (
		<Section
			className={className}
			style={{
				...restStyles,
				...style,
			}}
		>
			<div
				style={{
					boxSizing: 'border-box',
					padding,
					...(minHeight ? { minHeight } : undefined),
				}}
			>
				{children}
			</div>
		</Section>
	);
}
