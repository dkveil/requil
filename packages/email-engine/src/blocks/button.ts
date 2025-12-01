import type { BlockIR } from '@requil/types';
import { generateAllStyles, generateLinkAttributes } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

export function renderButton(block: BlockIR): string {
	const text = (block.props.text as string) || 'Button';
	const href = (block.props.href as string) || '#';

	const linkAttrs = generateLinkAttributes(block.props);
	const target = linkAttrs?.target || '_self';
	const rel = linkAttrs?.rel;

	const styles = generateAllStyles(block.props);
	const buttonStyles = {
		...styles,
		display: 'inline-block',
		textDecoration: 'none',
	};

	const styleString = generateInlineStyles(buttonStyles);

	return `
<table cellpadding="0" cellspacing="0" border="0">
	<tr>
		<td style="border-radius: ${block.props.borderRadius || block.props.radius || 0}px;">
			<a href="${escapeHtml(href)}" target="${target}"${rel ? ` rel="${rel}"` : ''}${styleString ? ` style="${styleString}"` : ''}>${escapeHtml(text)}</a>
		</td>
	</tr>
</table>`.trim();
}
