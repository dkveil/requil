import type { BlockIR } from '@requil/types/editor';
import { escapeHtml } from '../utils/format';

/**
 * Renders Quote block
 */
export function renderQuoteBlock(block: BlockIR): string {
	const quoteText = escapeHtml(
		String(block.props.text || block.props.content || '')
	);
	const citation = block.props.citation
		? `<footer style="margin-top:8px;font-size:0.875em;opacity:0.8;">— ${escapeHtml(String(block.props.citation))}</footer>`
		: '';

	return `<blockquote style="margin:0;padding:0;"><p style="margin:0;">${quoteText}</p>${citation}</blockquote>`;
}
