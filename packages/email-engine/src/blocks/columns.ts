import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { generateInlineStyles } from '../utils';

export function renderColumns(block: BlockIR, childrenHtml: string): string {
	const styles = generateAllStyles(block.props);
	const styleString = generateInlineStyles(styles);
	const stackOnMobile = block.props.stackOnMobile !== false;

	const processedChildren = childrenHtml
		.split('<!-- CHILD_SEPARATOR -->')
		.map((child) => {
			if (stackOnMobile && child.includes('<td')) {
				return child.replace('<td', '<td class="mobile-stack"');
			}
			return child;
		})
		.join('');

	return `
<table width="100%" cellpadding="0" cellspacing="0" border="0"${styleString ? ` style="${styleString}"` : ''}>
	<tr>
		${processedChildren}
	</tr>
</table>`.trim();
}
