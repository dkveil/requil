import type { BlockIR } from '@requil/types';

export function generateSizeStyles(
	props: BlockIR['props']
): Record<string, string | undefined> {
	const styles: Record<string, string | undefined> = {};

	if (props.width) {
		styles.width = props.width as string;
	}

	if (props.height) {
		styles.height = props.height as string;
	}

	if (props.minWidth) {
		styles.minWidth = props.minWidth as string;
	}

	if (props.maxWidth) {
		styles.maxWidth = props.maxWidth as string;
	}

	return styles;
}
