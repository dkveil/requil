import type { BlockIR } from '@requil/types';

export type AccessibilityAttributes = {
	htmlTag: string | undefined;
	ariaLabel: string | undefined;
};

export function generateAccessibilityAttributes(
	props: BlockIR['props']
): AccessibilityAttributes {
	return {
		htmlTag: props.htmlTag as string | undefined,
		ariaLabel: props.ariaLabel as string | undefined,
	};
}
