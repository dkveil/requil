import type { BlockIR } from '@requil/types/editor';

/**
 * Renders Columns block as mj-section with mj-column children
 */
export function renderColumnsBlock(
	block: BlockIR,
	attributesStr: string,
	childrenMjml: string[],
	warnings: string[]
): string {
	const attrStr = attributesStr ? ` ${attributesStr}` : '';

	if (!block.children || block.children.length === 0) {
		const columnCount = (block.props.columnCount as number) || 2;
		warnings.push(
			`Columns block ${block.id} has no children, creating ${columnCount} empty columns`
		);

		const columnWidth = `${Math.floor(100 / columnCount)}%`;
		return `<mj-section${attrStr}>
${Array.from({ length: columnCount })
	.map(() => `  <mj-column width="${columnWidth}"></mj-column>`)
	.join('\n')}
</mj-section>`;
	}

	const columnCount =
		(block.props.columnCount as number) || block.children.length;
	const columnWidth = `${Math.floor(100 / columnCount)}%`;

	const columns = childrenMjml.map((childMjml, index) => {
		const child = block.children?.[index];
		if (child?.type === 'Column') {
			return childMjml;
		}
		return `<mj-column width="${columnWidth}">\n${childMjml}\n</mj-column>`;
	});

	return `<mj-section${attrStr}>
${columns.join('\n')}
</mj-section>`;
}
