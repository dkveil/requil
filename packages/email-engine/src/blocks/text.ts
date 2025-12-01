import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

export function renderText(block: BlockIR): string {
	const content = block.props.content as string | undefined;

	if (!content) {
		return '';
	}

	const safeContent = escapeHtml(content);
	const styles = generateAllStyles(block.props);
	const styleString = generateInlineStyles(styles);

	return `<p${styleString ? ` style="${styleString}"` : ''}>${safeContent}</p>`;
}
