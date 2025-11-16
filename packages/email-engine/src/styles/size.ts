import { formatValue } from '../utils/format';

/**
 * Converts size-related properties to MJML attributes
 * Handles: width, height, minWidth, maxWidth
 */
export function convertSizeProps(
	blockType: string,
	props: Record<string, unknown>
): string[] {
	const attrs: string[] = [];

	// Src - required for Image
	if (blockType === 'Image' && props.src) {
		attrs.push(`src="${props.src}"`);
	}

	// Alt - for Image
	if (blockType === 'Image' && props.alt) {
		attrs.push(`alt="${props.alt}"`);
	}

	// Width - only for supported block types
	if (props.width !== undefined) {
		const supportsWidth = ['Button', 'Image', 'Column'];
		if (!supportsWidth.includes(blockType)) {
			return attrs;
		}

		const width = props.width;
		if (
			blockType === 'Image' &&
			typeof width === 'string' &&
			width.endsWith('%')
		) {
			const percentage = Number.parseFloat(width);
			const pixels = Math.round((600 * percentage) / 100);
			attrs.push(`width="${pixels}px"`);
			attrs.push(`fluid-on-mobile="true"`);
		} else if (width !== 'auto') {
			attrs.push(`width="${formatValue(width)}"`);
		}
	}

	// Height
	if (props.height !== undefined && blockType === 'Image') {
		const height = props.height;
		if (height !== 'auto') {
			attrs.push(`height="${formatValue(height)}"`);
		}
	} else if (props.height !== undefined && props.height !== 'auto') {
		attrs.push(`height="${formatValue(props.height)}"`);
	}

	// Min/Max Width - not directly supported in MJML, skipped

	return attrs;
}
