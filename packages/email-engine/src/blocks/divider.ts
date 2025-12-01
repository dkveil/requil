import type { BlockIR } from '@requil/types';
import { generateStylesStyles } from '../attributes';
import { generateInlineStyles } from '../utils';

export function renderDivider(block: BlockIR): string {
	const styles = generateStylesStyles(block.props);
	const borderValue = styles.border || '1px solid #e0e0e0';

	const dividerStyles: Record<string, string | number | undefined> = {
		borderTop: borderValue,
		margin: '16px 0',
		backgroundColor: styles.backgroundColor,
		opacity: styles.opacity,
	};

	const styleString = generateInlineStyles(dividerStyles);

	return `<hr${styleString ? ` style="${styleString}"` : ''} />`;
}
