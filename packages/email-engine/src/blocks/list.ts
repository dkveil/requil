import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

export function renderList(block: BlockIR): string {
	const items =
		(block.props.items as Array<{ id: string; text: string }>) || [];
	const listType = (block.props.listType as string) || 'bullet';

	if (items.length === 0) {
		return '';
	}

	const styles = generateAllStyles(block.props);
	const styleString = generateInlineStyles(styles);

	const tag = listType === 'numbered' ? 'ol' : 'ul';

	const listItems = items
		.map((item) => `<li>${escapeHtml(item.text)}</li>`)
		.join('\n');

	return `<${tag}${styleString ? ` style="${styleString}"` : ''}>${listItems}</${tag}>`;
}
