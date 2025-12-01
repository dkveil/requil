import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

export function renderImage(block: BlockIR): string {
	const src = block.props.src as string | undefined;
	const alt = (block.props.alt as string) || '';
	const width = block.props.width as string | undefined;
	const height = block.props.height as string | undefined;

	if (!src) {
		return '';
	}

	const styles = generateAllStyles(block.props);
	const styleString = generateInlineStyles(styles);

	const widthAttr = width ? ` width="${width}"` : '';
	const heightAttr = height ? ` height="${height}"` : '';

	return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${widthAttr}${heightAttr}${styleString ? ` style="${styleString}"` : ''} />`;
}
