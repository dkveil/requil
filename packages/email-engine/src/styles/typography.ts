import { formatValue } from '../utils/format';

/**
 * Converts typography-related properties to MJML attributes
 * Handles: fontSize, fontWeight, textAlign, lineHeight, letterSpacing, fontFamily, textColor
 */
export function convertTypographyProps(
	props: Record<string, unknown>
): string[] {
	const attrs: string[] = [];

	if (props.fontSize !== undefined) {
		attrs.push(`font-size="${formatValue(props.fontSize)}"`);
	}

	if (props.fontWeight !== undefined) {
		attrs.push(`font-weight="${props.fontWeight}"`);
	}

	if (props.textAlign !== undefined) {
		attrs.push(`align="${props.textAlign}"`);
	}

	if (props.lineHeight !== undefined) {
		attrs.push(`line-height="${props.lineHeight}"`);
	}

	if (props.letterSpacing !== undefined) {
		attrs.push(`letter-spacing="${formatValue(props.letterSpacing)}"`);
	}

	if (props.fontFamily !== undefined) {
		attrs.push(`font-family="${props.fontFamily}"`);
	}

	if (props.textColor !== undefined) {
		attrs.push(`color="${props.textColor}"`);
	}

	return attrs;
}
