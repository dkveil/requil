import type { BlockIR } from '@requil/types';

function extractFillColor(fill: unknown): string | undefined {
	if (!fill) return undefined;
	if (typeof fill === 'string') return fill;
	if (typeof fill === 'object' && 'color' in fill) {
		return (fill as { color: string }).color;
	}
	return undefined;
}

interface BorderSideValue {
	width?: number;
	color?: string;
	style?: string;
}

interface BorderObject {
	width?: number;
	color?: string;
	style?: string;
	top?: BorderSideValue | null;
	right?: BorderSideValue | null;
	bottom?: BorderSideValue | null;
	left?: BorderSideValue | null;
}

function formatBorderSide(
	side: BorderSideValue | null | undefined,
	base: BorderSideValue
): string | undefined {
	if (side === null) return undefined;

	const merged = side ? { ...base, ...side } : base;

	const width = merged.width ?? 0;
	const style = merged.style ?? 'solid';
	const color = merged.color ?? '#000000';

	if (width === 0) return 'none';

	return `${width}px ${style} ${color}`;
}

function convertBorder(border: unknown): Record<string, string | undefined> {
	if (!border || typeof border !== 'object') return {};

	const b = border as BorderObject;
	const styles: Record<string, string | undefined> = {};

	const hasBase =
		b.width !== undefined || b.color !== undefined || b.style !== undefined;
	const hasSides =
		b.top !== undefined ||
		b.right !== undefined ||
		b.bottom !== undefined ||
		b.left !== undefined;

	if (!(hasBase || hasSides)) return {};

	const base: BorderSideValue = {
		width: b.width,
		color: b.color,
		style: b.style,
	};

	styles.borderTop = 'none';
	styles.borderRight = 'none';
	styles.borderBottom = 'none';
	styles.borderLeft = 'none';

	if (hasBase && !hasSides) {
		const borderValue = formatBorderSide(base, base);
		if (borderValue) {
			styles.borderTop = borderValue;
			styles.borderRight = borderValue;
			styles.borderBottom = borderValue;
			styles.borderLeft = borderValue;
		}
	} else {
		const topValue = formatBorderSide(b.top, base);
		if (topValue) styles.borderTop = topValue;

		const rightValue = formatBorderSide(b.right, base);
		if (rightValue) styles.borderRight = rightValue;

		const bottomValue = formatBorderSide(b.bottom, base);
		if (bottomValue) styles.borderBottom = bottomValue;

		const leftValue = formatBorderSide(b.left, base);
		if (leftValue) styles.borderLeft = leftValue;
	}

	return styles;
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

	const borderStyles = convertBorder(props.border);
	Object.assign(styles, borderStyles);

	if (props.radius !== undefined && props.radius !== 0) {
		styles.borderRadius = props.radius as number;
	}

	return styles;
}
