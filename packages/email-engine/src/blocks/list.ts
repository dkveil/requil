import type { BlockIR } from '@requil/types/editor';
import { escapeHtml } from '../utils/format';

/**
 * Renders List block
 */
export function renderListBlock(block: BlockIR): string {
	if (!Array.isArray(block.props.items)) {
		return '';
	}

	const items = block.props.items as Array<
		{ id: string; text: string } | string
	>;
	const listType = block.props.listType === 'ordered' ? 'ol' : 'ul';
	const listItems = items
		.map((item) => {
			const text = typeof item === 'string' ? item : item.text;
			return `<li>${escapeHtml(text)}</li>`;
		})
		.join('');

	return `<${listType} style="margin:0;padding-left:25px;">${listItems}</${listType}>`;
}
