import type { BlockIR } from '@requil/types';

export function renderSpacer(block: BlockIR): string {
	const height = (block.props.height as number) || 20;

	return `<div style="height: ${height}px; line-height: ${height}px; font-size: ${height}px;">&nbsp;</div>`;
}
