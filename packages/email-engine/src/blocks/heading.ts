import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

export function renderHeading(block: BlockIR): string {
	const content = block.props.content as string | undefined;
	const level = (block.props.level as string) || 'h2';

	if (!content) {
		return '';
	}

	const safeContent = escapeHtml(content);
	const styles = generateAllStyles(block.props);
	const styleString = generateInlineStyles(styles);

	return `<${level}${styleString ? ` style="${styleString}"` : ''}>${safeContent}</${level}>`;
}
