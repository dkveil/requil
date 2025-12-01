import type { BlockIR } from '@requil/types';

export function convertAlignToTableAlign(
	align: unknown
): 'left' | 'center' | 'right' | undefined {
	if (!align || typeof align !== 'string') return undefined;

	const alignMap: Record<string, 'left' | 'center' | 'right'> = {
		'flex-start': 'left',
		center: 'center',
		'flex-end': 'right',
		stretch: 'left',
		baseline: 'left',
	};

	return alignMap[align];
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
		const p = padding as {
			top?: number;
			right?: number;
			bottom?: number;
			left?: number;
		};

		if (!(p.top || p.right || p.bottom || p.left)) {
			return undefined;
		}

		return `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
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

	const paddingValue = convertPadding(props.padding);
	if (paddingValue) {
		styles.padding = paddingValue;
	}

	return styles;
}
