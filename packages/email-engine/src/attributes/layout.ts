import type { BlockIR } from '@requil/types';

export function convertVerticalAlign(
	verticalAlign: unknown
): 'top' | 'middle' | 'bottom' {
	if (!verticalAlign || typeof verticalAlign !== 'string') return 'top';

	if (
		verticalAlign === 'top' ||
		verticalAlign === 'middle' ||
		verticalAlign === 'bottom'
	) {
		return verticalAlign;
	}

	return 'top';
}

type SpacingValue = number | 'auto';

interface SpacingObject {
	top?: SpacingValue;
	right?: SpacingValue;
	bottom?: SpacingValue;
	left?: SpacingValue;
}

export function convertPadding(padding: unknown): string | undefined {
	if (padding === undefined || padding === null) return undefined;

	if (typeof padding === 'number') {
		return padding === 0 ? undefined : `${padding}px`;
	}

	if (typeof padding === 'string') {
		return padding;
	}

	if (typeof padding === 'object') {
		const p = padding as SpacingObject;

		const hasAnyValue =
			p.top !== undefined ||
			p.right !== undefined ||
			p.bottom !== undefined ||
			p.left !== undefined;

		if (!hasAnyValue) {
			return undefined;
		}

		const formatValue = (val: SpacingValue | undefined) => {
			if (val === undefined || val === 0) return '0';
			if (val === 'auto') return 'auto';
			return `${val}px`;
		};

		return `${formatValue(p.top)} ${formatValue(p.right)} ${formatValue(p.bottom)} ${formatValue(p.left)}`;
	}

	return undefined;
}

export function convertMargin(margin: unknown): string | undefined {
	if (margin === undefined || margin === null) return undefined;

	if (margin === 'auto') {
		return 'auto';
	}

	if (typeof margin === 'number') {
		return margin === 0 ? undefined : `${margin}px`;
	}

	if (typeof margin === 'string') {
		return margin;
	}

	if (typeof margin === 'object') {
		const m = margin as SpacingObject;

		if (!(m.top || m.right || m.bottom || m.left)) {
			return undefined;
		}

		const formatValue = (val: SpacingValue | undefined) => {
			if (val === 'auto') return 'auto';
			if (val === undefined || val === 0) return '0';
			return `${val}px`;
		};

		return `${formatValue(m.top)} ${formatValue(m.right)} ${formatValue(m.bottom)} ${formatValue(m.left)}`;
	}

	return undefined;
}

export function extractGap(props: BlockIR['props']): number {
	return (props.gap as number) ?? 0;
}

export function generateLayoutStyles(
	props: BlockIR['props']
): Record<string, string | undefined> {
	const styles: Record<string, string | undefined> = {};

	const verticalAlign = convertVerticalAlign(props.verticalAlign);
	if (verticalAlign) {
		styles.verticalAlign = verticalAlign;
	}

	const paddingValue = convertPadding(props.padding);
	if (paddingValue) {
		styles.padding = paddingValue;
	}

	const marginValue = convertMargin(props.margin);
	if (marginValue) {
		styles.margin = marginValue;
	}

	return styles;
}
