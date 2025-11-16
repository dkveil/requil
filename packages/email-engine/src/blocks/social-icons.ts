import type { BlockIR } from '@requil/types/editor';
import { NETWORK_ICONS } from '../utils/icons';

/**
 * Renders SocialIcons block as table-based HTML
 */
export function renderSocialIconsBlock(block: BlockIR): string {
	const mode = (block.props.mode as string) || 'horizontal';
	const iconSize = (block.props.iconSize as string) || '20px';
	const iconColor = (block.props.iconColor as string) || '#000000';
	const textMode = Boolean(block.props.textMode);
	const textPosition = (block.props.textPosition as string) || 'beside';

	const gapProp = block.props.gap;
	const gapValue =
		gapProp !== undefined && gapProp !== null && gapProp !== 0
			? `${gapProp}px`
			: '8px';

	// Get alignment
	const align = (block.props.align as string) || 'center';
	const mjmlAlign =
		align === 'flex-start' ? 'left' : align === 'flex-end' ? 'right' : 'center';
	const tableAlign = mjmlAlign;

	// Get typography props when text mode is enabled
	const fontSize = textMode ? (block.props.fontSize as number) || 13 : 13;
	const fontWeight = textMode
		? (block.props.fontWeight as string) || 'normal'
		: 'normal';
	const fontFamily = textMode ? (block.props.fontFamily as string) : undefined;
	const textColor = textMode
		? (block.props.textColor as string) || '#000000'
		: '#000000';

	if (!Array.isArray(block.props.icons) || block.props.icons.length === 0) {
		return '';
	}

	const icons = block.props.icons as Array<{
		id: string;
		network: string;
		href: string;
		alt?: string;
	}>;

	let tableHtml = '';

	if (mode === 'horizontal') {
		// Horizontal layout - use table with inline cells
		const iconCells = icons
			.map((icon, index) => {
				const networkLabel =
					icon.network.charAt(0).toUpperCase() + icon.network.slice(1);
				const iconSvg = NETWORK_ICONS[icon.network] || NETWORK_ICONS.web;
				const paddingRight = index < icons.length - 1 ? gapValue : '0';

				// For text below: use nested table with rows (flex-direction: column)
				if (textMode && textPosition === 'below') {
					return `<td style="padding-right:${paddingRight};" valign="middle">
							<a href="${icon.href}" style="display:block;text-decoration:none;color:#000000;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;">
									<tr><td align="center" style="padding:0;">
										<div style="width:${iconSize};height:${iconSize};color:${iconColor};">${iconSvg}</div>
									</td></tr>
									<tr><td align="center" style="padding-top:2px;">
										<span style="font-size:${fontSize}px;font-weight:${fontWeight};${fontFamily ? `font-family:${fontFamily};` : ''}color:${textColor};">${networkLabel}</span>
									</td></tr>
								</table>
							</a>
						</td>`;
				}

				// For text beside: use nested table with columns (flex-direction: row)
				if (textMode) {
					return `<td style="padding-right:${paddingRight};" valign="middle">
							<a href="${icon.href}" style="display:block;text-decoration:none;color:#000000;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;">
									<tr>
										<td valign="middle" style="padding:0;">
											<div style="width:${iconSize};height:${iconSize};color:${iconColor};">${iconSvg}</div>
										</td>
										<td valign="middle" style="padding-left:4px;">
											<span style="font-size:${fontSize}px;font-weight:${fontWeight};${fontFamily ? `font-family:${fontFamily};` : ''}color:${textColor};">${networkLabel}</span>
										</td>
									</tr>
								</table>
							</a>
						</td>`;
				}

				// Icon only
				return `<td style="padding-right:${paddingRight};" valign="middle">
						<a href="${icon.href}" style="display:block;text-decoration:none;">
							<div style="width:${iconSize};height:${iconSize};color:${iconColor};">${iconSvg}</div>
						</a>
					</td>`;
			})
			.join('');

		tableHtml = `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${tableAlign}" style="margin:0;padding:0;">
<tr>${iconCells}</tr>
</table>`;
	} else {
		// Vertical layout - use table with rows
		const iconRows = icons
			.map((icon, index) => {
				const networkLabel =
					icon.network.charAt(0).toUpperCase() + icon.network.slice(1);
				const iconSvg = NETWORK_ICONS[icon.network] || NETWORK_ICONS.web;
				const paddingBottom = index < icons.length - 1 ? gapValue : '0';

				// For text below: use nested table with rows
				if (textMode && textPosition === 'below') {
					return `<tr><td style="padding-bottom:${paddingBottom};">
							<a href="${icon.href}" style="display:block;text-decoration:none;color:#000000;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;">
									<tr><td align="center" style="padding:0;">
										<div style="width:${iconSize};height:${iconSize};color:${iconColor};">${iconSvg}</div>
									</td></tr>
									<tr><td align="center" style="padding-top:2px;">
										<span style="font-size:${fontSize}px;font-weight:${fontWeight};${fontFamily ? `font-family:${fontFamily};` : ''}color:${textColor};">${networkLabel}</span>
									</td></tr>
								</table>
							</a>
						</td></tr>`;
				}

				// For text beside: use nested table with columns
				if (textMode) {
					return `<tr><td style="padding-bottom:${paddingBottom};">
							<a href="${icon.href}" style="display:block;text-decoration:none;color:#000000;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;">
									<tr>
										<td valign="middle" style="padding:0;">
											<div style="width:${iconSize};height:${iconSize};color:${iconColor};">${iconSvg}</div>
										</td>
										<td valign="middle" style="padding-left:4px;">
											<span style="font-size:${fontSize}px;font-weight:${fontWeight};${fontFamily ? `font-family:${fontFamily};` : ''}color:${textColor};">${networkLabel}</span>
										</td>
									</tr>
								</table>
							</a>
						</td></tr>`;
				}

				// Icon only
				return `<tr><td style="padding-bottom:${paddingBottom};">
						<a href="${icon.href}" style="display:block;text-decoration:none;">
							<div style="width:${iconSize};height:${iconSize};color:${iconColor};">${iconSvg}</div>
						</a>
					</td></tr>`;
			})
			.join('');

		tableHtml = `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${tableAlign}" style="margin:0;padding:0;">
${iconRows}
</table>`;
	}

	return tableHtml;
}
