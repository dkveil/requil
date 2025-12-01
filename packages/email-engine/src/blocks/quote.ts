import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

export function renderQuote(block: BlockIR): string {
	const text = block.props.text as string | undefined;
	const citation = block.props.citation as string | undefined;

	if (!text) {
		return '';
	}

	const styles = generateAllStyles(block.props);
	const quoteStyles = {
		...styles,
		borderLeft: '4px solid #ccc',
		paddingLeft: '16px',
		margin: '16px 0',
		fontStyle: 'italic',
	};

	const styleString = generateInlineStyles(quoteStyles);

	const citationHtml = citation
		? `<footer style="margin-top: 8px; font-size: 14px;">— ${escapeHtml(citation)}</footer>`
		: '';

	return `<blockquote${styleString ? ` style="${styleString}"` : ''}>${escapeHtml(text)}${citationHtml}</blockquote>`;
}
