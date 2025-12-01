import type { BlockIR } from '@requil/types';
import { generateAllStyles } from '../attributes';
import { escapeHtml, generateInlineStyles } from '../utils';

interface SocialIcon {
	id: string;
	network: string;
	href: string;
	alt?: string;
}

export function renderSocialIcons(block: BlockIR): string {
	const icons = (block.props.icons as SocialIcon[]) || [];
	const iconSize = (block.props.iconSize as string) || '32px';
	const mode = (block.props.mode as string) || 'horizontal';

	if (icons.length === 0) {
		return '';
	}

	const styles = generateAllStyles(block.props);
	const styleString = generateInlineStyles(styles);

	const iconElements = icons
		.map((icon) => {
			const iconUrl = `https://cdn.simpleicons.org/${icon.network}`;
			return `
<td style="padding: 0 8px;">
	<a href="${escapeHtml(icon.href)}" target="_blank" rel="noopener noreferrer">
		<img src="${iconUrl}" alt="${escapeHtml(icon.alt || icon.network)}" width="${iconSize}" height="${iconSize}" style="display: block;" />
	</a>
</td>`.trim();
		})
		.join('\n');

	if (mode === 'vertical') {
		return `
<table cellpadding="0" cellspacing="0" border="0"${styleString ? ` style="${styleString}"` : ''}>
	${icons.map((icon) => `<tr>${iconElements}</tr>`).join('\n')}
</table>`.trim();
	}

	return `
<table cellpadding="0" cellspacing="0" border="0"${styleString ? ` style="${styleString}"` : ''}>
	<tr>
		${iconElements}
	</tr>
</table>`.trim();
}
