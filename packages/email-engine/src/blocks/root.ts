import type { BlockIR } from '@requil/types/editor';
import { getCssReset } from '../styles/css-reset';
import { REQUIRES_COLUMN } from '../utils/constants';

/**
 * Renders Root block as complete MJML document
 */
export function renderRootBlock(
	block: BlockIR,
	childrenMjml: string[]
): string {
	const backgroundColor =
		(block.props.fill as { color?: string })?.color || '#F4F4F5';
	const fontFamily = String(
		block.props.fontFamily ||
			'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	);

	const children = childrenMjml.filter((mjml) => mjml.length > 0).join('\n');

	return `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${fontFamily}" />
      <mj-text padding="0" />
      <mj-section padding="0" />
    </mj-attributes>
    <mj-style>
      ${getCssReset()}
    </mj-style>
  </mj-head>
  <mj-body background-color="${backgroundColor}">
${children}
  </mj-body>
</mjml>`;
}
