import type { BlockIR } from '@requil/types';
import type React from 'react';

function applyFillStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (props.fill && typeof props.fill === 'object' && props.fill !== null) {
		const fill = props.fill as Record<string, unknown>;
		if (typeof fill.color === 'string') {
			styles.backgroundColor = fill.color;
		}
	}
}

function applyRadiusStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (typeof props.radius === 'number') {
		styles.borderRadius = props.radius;
	} else if (typeof props.radius === 'object' && props.radius !== null) {
		const radius = props.radius as Record<string, unknown>;
		if (typeof radius.top === 'number') styles.borderTopLeftRadius = radius.top;
		if (typeof radius.right === 'number')
			styles.borderTopRightRadius = radius.right;
		if (typeof radius.bottom === 'number')
			styles.borderBottomRightRadius = radius.bottom;
		if (typeof radius.left === 'number')
			styles.borderBottomLeftRadius = radius.left;
	}
}

function applyBorderStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (
		props.border &&
		typeof props.border === 'object' &&
		props.border !== null
	) {
		const border = props.border as Record<string, unknown>;
		if (typeof border.width === 'number' && border.width > 0) {
			styles.borderWidth = border.width;
			styles.borderStyle = (border.style as string) || 'solid';
			if (typeof border.color === 'string') {
				styles.borderColor = border.color;
			}
		}
		if (typeof border.radius === 'number') {
			styles.borderRadius = border.radius;
		}
	}

	applyRadiusStyles(props, styles);
}

function applySpacingStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (typeof props.paddingTop === 'number') {
		styles.paddingTop = props.paddingTop;
	}
	if (typeof props.paddingBottom === 'number') {
		styles.paddingBottom = props.paddingBottom;
	}
	if (typeof props.paddingLeft === 'number') {
		styles.paddingLeft = props.paddingLeft;
	}
	if (typeof props.paddingRight === 'number') {
		styles.paddingRight = props.paddingRight;
	}

	if (typeof props.padding === 'number') {
		styles.padding = props.padding;
	} else if (typeof props.padding === 'object' && props.padding !== null) {
		const padding = props.padding as Record<string, unknown>;
		if (typeof padding.top === 'number') styles.paddingTop = padding.top;
		if (typeof padding.right === 'number') styles.paddingRight = padding.right;
		if (typeof padding.bottom === 'number')
			styles.paddingBottom = padding.bottom;
		if (typeof padding.left === 'number') styles.paddingLeft = padding.left;
	}
}

function applyDimensionStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (typeof props.width === 'string' || typeof props.width === 'number') {
		styles.width = props.width;
	}
	if (typeof props.height === 'string' || typeof props.height === 'number') {
		styles.height = props.height;
	}
	if (
		typeof props.minWidth === 'string' ||
		typeof props.minWidth === 'number'
	) {
		styles.minWidth = props.minWidth;
	}
	if (
		typeof props.maxWidth === 'string' ||
		typeof props.maxWidth === 'number'
	) {
		styles.maxWidth = props.maxWidth;
	}
	if (
		typeof props.minHeight === 'string' ||
		typeof props.minHeight === 'number'
	) {
		styles.minHeight = props.minHeight;
	}
}

function applyLayoutStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (typeof props.align === 'string') {
		styles.alignItems = props.align;
	}
	if (typeof props.gap === 'number') {
		styles.gap = props.gap;
	}
}

function applyTypographyStyles(
	props: BlockIR['props'],
	styles: React.CSSProperties
): void {
	if (typeof props.fontSize === 'number') {
		styles.fontSize = props.fontSize;
	}
	if (typeof props.fontWeight === 'string') {
		styles.fontWeight = props.fontWeight;
	}
	if (typeof props.fontFamily === 'string') {
		styles.fontFamily = props.fontFamily;
	}
	if (typeof props.textAlign === 'string') {
		styles.textAlign = props.textAlign as React.CSSProperties['textAlign'];
	}
	if (typeof props.lineHeight === 'number') {
		styles.lineHeight = props.lineHeight;
	}
	if (typeof props.letterSpacing === 'number') {
		styles.letterSpacing = props.letterSpacing;
	}

	if (props.textColor && typeof props.textColor === 'string') {
		styles.color = props.textColor;
	}
}

export function convertPropsToStyles(
	props: BlockIR['props']
): React.CSSProperties {
	const styles: React.CSSProperties = {};

	if (typeof props.opacity === 'number') {
		styles.opacity = props.opacity;
	}

	applyFillStyles(props, styles);
	applyBorderStyles(props, styles);
	applySpacingStyles(props, styles);
	applyDimensionStyles(props, styles);
	applyLayoutStyles(props, styles);
	applyTypographyStyles(props, styles);

	return styles;
}
