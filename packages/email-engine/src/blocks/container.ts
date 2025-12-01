import type { BlockIR } from '@requil/types';
import { convertAlignToTableAlign, generateAllStyles } from '../attributes';
import { createTableWrapper, generateInlineStyles } from '../utils';

export function renderContainer(block: BlockIR, childrenHtml: string): string {
	const styles = generateAllStyles(block.props);
	const maxWidth = block.props.maxWidth as string | undefined;
	const align = convertAlignToTableAlign(block.props.align);

	const innerTable = createTableWrapper(childrenHtml, {
		width: maxWidth || '600px',
		align: align || 'center',
		backgroundColor: styles.backgroundColor as string | undefined,
		padding: styles.padding as string | undefined,
	});

	return innerTable;
}
