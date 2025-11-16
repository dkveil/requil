import type { BlockIR } from '@requil/types/editor';

/**
 * Renders Column block
 */
export function renderColumnBlock(
	attributesStr: string,
	childrenMjml: string[]
): string {
	const attrStr = attributesStr ? ` ${attributesStr}` : '';
	const children = childrenMjml.filter((mjml) => mjml.length > 0).join('\n');

	if (children.length === 0) {
		return `<mj-column${attrStr}></mj-column>`;
	}

	return `<mj-column${attrStr}>
${children}
</mj-column>`;
}
