import type { BlockIR } from '@requil/types';

function extractFillColor(fill: unknown): string | undefined {
	if (!fill) return undefined;
	if (typeof fill === 'string') return fill;
	if (typeof fill === 'object' && 'color' in fill) {
		return (fill as { color: string }).color;
	}
	return undefined;
}

function convertBorder(border: unknown): string | undefined {
	if (!border || typeof border !== 'object') return undefined;

	const b = border as {
		width?: number;
		color?: string;
		style?: string;
	};

	if (!(b.width || b.color || b.style)) return undefined;

	const width = b.width ?? 1;
	const style = b.style ?? 'solid';
	const color = b.color ?? '#000000';

	return `${width}px ${style} ${color}`;
}

export function generateStylesStyles(
	props: BlockIR['props']
): Record<string, string | number | undefined> {
	const styles: Record<string, string | number | undefined> = {};

	if (props.opacity !== undefined && props.opacity !== 1) {
		styles.opacity = props.opacity as number;
	}

	const bgColor = extractFillColor(props.fill);
	if (bgColor) {
		styles.backgroundColor = bgColor;
	}

	const borderValue = convertBorder(props.border);
	if (borderValue) {
		styles.border = borderValue;
	}

	if (props.radius !== undefined && props.radius !== 0) {
		styles.borderRadius = props.radius as number;
	}

	return styles;
}
