import type { BlockIR } from '@requil/types';

export function generateTypographyStyles(
	props: BlockIR['props']
): Record<string, string | number | undefined> {
	const styles: Record<string, string | number | undefined> = {};

	if (props.fontSize !== undefined) {
		styles.fontSize = props.fontSize as number;
	}

	if (props.fontWeight !== undefined) {
		styles.fontWeight = props.fontWeight as string | number;
	}

	if (props.textAlign) {
		styles.textAlign = props.textAlign as string;
	}

	if (props.lineHeight !== undefined) {
		styles.lineHeight = props.lineHeight as number;
	}

	if (props.letterSpacing !== undefined) {
		const spacing = props.letterSpacing as number;
		styles.letterSpacing = spacing === 0 ? 'normal' : `${spacing}px`;
	}

	if (props.fontFamily) {
		styles.fontFamily = props.fontFamily as string;
	}

	if (props.textColor) {
		styles.color = props.textColor as string;
	}

	return styles;
}
