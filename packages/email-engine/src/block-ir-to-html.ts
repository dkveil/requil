import type { BlockIR, Document } from '@requil/types/editor';
import {
	renderBlock,
	renderButton,
	renderColumn,
	renderColumns,
	renderContainer,
	renderDivider,
	renderHeading,
	renderImage,
	renderList,
	renderQuote,
	renderRoot,
	renderSocialIcons,
	renderSpacer,
	renderText,
} from './blocks';

export type HtmlConversionResult = {
	html: string;
	warnings: string[];
	errors: string[];
};

function renderBlockIR(
	block: BlockIR,
	warnings: string[],
	errors: string[]
): string {
	const hasChildren = block.children && block.children.length > 0;

	let childrenHtml = '';
	if (hasChildren) {
		childrenHtml = block
			.children!.map((child) => renderBlockIR(child, warnings, errors))
			.filter((html) => html.length > 0)
			.join('<!-- CHILD_SEPARATOR -->');
	}

	try {
		switch (block.type) {
			case 'Text':
				return renderText(block);
			case 'Heading':
				return renderHeading(block);
			case 'Button':
				return renderButton(block);
			case 'Image':
				return renderImage(block);
			case 'List':
				return renderList(block);
			case 'Quote':
				return renderQuote(block);
			case 'Spacer':
				return renderSpacer(block);
			case 'Divider':
				return renderDivider(block);
			case 'SocialIcons':
				return renderSocialIcons(block);
			case 'Root':
				return renderRoot(block, childrenHtml);
			case 'Container':
				return renderContainer(block, childrenHtml);
			case 'Block':
				return renderBlock(block, childrenHtml);
			case 'Columns':
				return renderColumns(block, childrenHtml);
			case 'Column':
				return renderColumn(block, childrenHtml);
			default:
				errors.push(`Unknown block type: ${block.type}`);
				return '';
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		errors.push(`Error rendering block ${block.type}: ${errorMessage}`);
		return '';
	}
}

export function convertDocumentToHtml(
	document: Document
): HtmlConversionResult {
	const warnings: string[] = [];
	const errors: string[] = [];

	if (!document.root) {
		errors.push('Document has no root block');
		return { html: '', warnings, errors };
	}

	const html = renderBlockIR(document.root, warnings, errors);

	return {
		html,
		warnings,
		errors,
	};
}
