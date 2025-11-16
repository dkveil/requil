import type { BlockIR } from '@requil/types/editor';
import { escapeHtml } from '../utils/format';

/**
 * Renders Button block content
 */
export function renderButtonBlock(block: BlockIR): string {
	return escapeHtml(String(block.props.text || 'Click Me'));
}
