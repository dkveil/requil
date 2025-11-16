import type { BlockIR } from '@requil/types/editor';

/**
 * Renders Container block as mj-section with single column
 */
export function renderContainerBlock(
	attributesStr: string,
	childrenMjml: string[]
): string {
	const attrStr = attributesStr ? ` ${attributesStr}` : '';
	const children = childrenMjml.filter((mjml) => mjml.length > 0).join('\n');

	if (children.length === 0) {
		return `<mj-section${attrStr}>
  <mj-column></mj-column>
</mj-section>`;
	}

	return `<mj-section${attrStr}>
  <mj-column>
${children}
  </mj-column>
</mj-section>`;
}
