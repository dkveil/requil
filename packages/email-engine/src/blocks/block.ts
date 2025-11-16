import type { BlockIR } from '@requil/types/editor';

export function renderBlockBlock(
	block: BlockIR,
	attributesStr: string,
	childrenMjml: string[],
	children: BlockIR[]
): string {
	const validChildren = childrenMjml.filter((mjml) => mjml.length > 0);

	if (validChildren.length === 0) {
		return '';
	}

	const hasOnlyLayoutChildren = children.every(
		(child: BlockIR) =>
			child.type === 'Columns' ||
			child.type === 'Container' ||
			child.type === 'Block'
	);

	if (hasOnlyLayoutChildren) {
		return validChildren.join('\n');
	}

	const attrStr = attributesStr ? ` ${attributesStr}` : '';
	const result: string[] = [];
	const contentBuffer: string[] = [];

	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const childMjml = validChildren[i];

		if (!(child && childMjml)) continue;

		const isSectionLevel =
			child.type === 'Columns' ||
			child.type === 'Container' ||
			child.type === 'Block';

		if (isSectionLevel) {
			if (contentBuffer.length > 0) {
				result.push(
					`<mj-section${attrStr}>
  <mj-column>
${contentBuffer.join('\n')}
  </mj-column>
</mj-section>`
				);
				contentBuffer.length = 0;
			}
			result.push(childMjml);
		} else {
			contentBuffer.push(childMjml);
		}
	}

	if (contentBuffer.length > 0) {
		result.push(
			`<mj-section${attrStr}>
  <mj-column>
${contentBuffer.join('\n')}
  </mj-column>
</mj-section>`
		);
	}

	return result.join('\n');
}
