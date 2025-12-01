import type { BlockIR } from '@requil/types';
import {
	convertAlignToTableAlign,
	extractGap,
	generateAllStyles,
} from '../attributes';
import { createTableWrapper, generateInlineStyles } from '../utils';

export function renderBlock(block: BlockIR, childrenHtml: string): string {
	const styles = generateAllStyles(block.props);
	const align = convertAlignToTableAlign(block.props.align);
	const gap = extractGap(block.props);

	let content = childrenHtml;

	if (gap > 0 && block.children && block.children.length > 1) {
		const childrenArray = childrenHtml.split('<!-- CHILD_SEPARATOR -->');
		content = childrenArray.join(`<div style="height: ${gap}px;"></div>`);
	}

	const wrapper = createTableWrapper(content, {
		width: styles.width as string | undefined,
		align: align || 'left',
		backgroundColor: styles.backgroundColor as string | undefined,
		padding: styles.padding as string | undefined,
	});

	return wrapper;
}
