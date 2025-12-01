import type { BlockIR } from '@requil/types';
import { convertAlignToTableAlign, generateAllStyles } from '../attributes';
import { generateInlineStyles } from '../utils';

export function renderColumn(block: BlockIR, childrenHtml: string): string {
	const styles = generateAllStyles(block.props);
	const align = convertAlignToTableAlign(block.props.align);
	const styleString = generateInlineStyles(styles);

	return `
<td${align ? ` align="${align}"` : ''}${styleString ? ` style="${styleString}"` : ''} valign="top">
	<table width="100%" cellpadding="0" cellspacing="0" border="0">
		<tr>
			<td class="mobile-full-width">
				${childrenHtml}
			</td>
		</tr>
	</table>
</td>`.trim();
}
