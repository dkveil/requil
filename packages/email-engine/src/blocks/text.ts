import type { BlockIR } from '@requil/types/editor';
import { escapeHtml } from '../utils/format';

/**
 * Renders Text and Heading blocks
 */
export function renderTextBlock(block: BlockIR): string {
	return escapeHtml(String(block.props.content || block.props.text || ''));
}
