import { formatValue } from '../utils/format';

/**
 * Converts layout-related properties to MJML attributes
 * Handles: align, gap, padding
 */
export function convertLayoutProps(
	blockType: string,
	props: Record<string, unknown>
): string[] {
	const attrs: string[] = [];

	// Align - only for supported block types
	if (props.align !== undefined) {
		let align = props.align as string;
		// Convert flex values to MJML values
		if (align === 'flex-start') align = 'left';
		if (align === 'flex-end') align = 'right';
		if (align === 'stretch') align = 'left';
		if (align === 'baseline') align = 'left';

		const supportsAlign = [
			'Text',
			'Heading',
			'Button',
			'Image',
			'List',
			'Quote',
		];
		if (supportsAlign.includes(blockType)) {
			attrs.push(`align="${align}"`);
		}
	}

	// Padding
	if (props.padding !== undefined) {
		const padding = props.padding;
		if (typeof padding === 'number') {
			attrs.push(`padding="${padding}px"`);
		} else if (typeof padding === 'object' && padding !== null) {
			const p = padding as {
				top?: number;
				right?: number;
				bottom?: number;
				left?: number;
			};
			if (
				p.top !== undefined ||
				p.right !== undefined ||
				p.bottom !== undefined ||
				p.left !== undefined
			) {
				const top = p.top ?? 0;
				const right = p.right ?? 0;
				const bottom = p.bottom ?? 0;
				const left = p.left ?? 0;
				attrs.push(`padding="${top}px ${right}px ${bottom}px ${left}px"`);
			}
		}
	}

	return attrs;
}
