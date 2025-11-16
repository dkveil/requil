import { formatValue } from '../utils/format';

/**
 * Converts style-related properties to MJML attributes
 * Handles: opacity, fill, border, radius
 */
export function convertStyleProps(
	blockType: string,
	props: Record<string, unknown>
): string[] {
	const attrs: string[] = [];

	// Fill (background color)
	if (props.fill && typeof props.fill === 'object') {
		const fill = props.fill as { color?: string };
		if (fill.color) {
			if (blockType === 'Button') {
				attrs.push(`background-color="${fill.color}"`);
			} else {
				attrs.push(`container-background-color="${fill.color}"`);
			}
		}
	}

	// Border
	if (props.border && typeof props.border === 'object') {
		const border = props.border as {
			width?: number;
			color?: string;
			style?: string;
		};
		if (border.width !== undefined) {
			attrs.push(`border-width="${border.width}px"`);
		}
		if (border.color) {
			attrs.push(`border-color="${border.color}"`);
		}
		if (border.style) {
			attrs.push(`border-style="${border.style}"`);
		}
	}

	// Radius (borderRadius) - only for Button
	if (blockType === 'Button') {
		if (props.borderRadius !== undefined) {
			attrs.push(`border-radius="${formatValue(props.borderRadius)}"`);
		} else if (props.radius !== undefined) {
			if (typeof props.radius === 'number') {
				attrs.push(`border-radius="${props.radius}px"`);
			} else if (typeof props.radius === 'object' && props.radius !== null) {
				const r = props.radius as {
					top?: number;
					right?: number;
					bottom?: number;
					left?: number;
				};
				if (
					r.top === r.right &&
					r.right === r.bottom &&
					r.bottom === r.left &&
					r.top !== undefined
				) {
					attrs.push(`border-radius="${r.top}px"`);
				}
			}
		}
	}

	return attrs;
}
