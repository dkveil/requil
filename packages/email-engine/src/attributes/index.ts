import type { BlockIR } from '@requil/types';

export * from './accessibility';
export * from './layout';
export * from './link';
export * from './size';
export * from './styles';
export * from './typography';

import { generateAccessibilityAttributes } from './accessibility';
import { generateLayoutStyles } from './layout';
import { generateLinkAttributes } from './link';
import { generateSizeStyles } from './size';
import { generateStylesStyles } from './styles';
import { generateTypographyStyles } from './typography';

export function generateAllStyles(
	props: BlockIR['props']
): Record<string, string | number | undefined> {
	return {
		...generateTypographyStyles(props),
		...generateStylesStyles(props),
		...generateSizeStyles(props),
		...generateLayoutStyles(props),
	};
}

export function generateAllAttributes(props: BlockIR['props']) {
	return {
		accessibility: generateAccessibilityAttributes(props),
		link: generateLinkAttributes(props),
	};
}
