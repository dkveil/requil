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

	return (
		<Section
			className={className}
			style={{
				...generatedStyles,
				...style,
			}}
		>
			{children}
		</Section>
	);
}
