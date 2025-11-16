import type { BlockIR, Document } from '@requil/types/editor';
import mjml2html from 'mjml';
// Block renderers
import { renderBlockBlock } from './blocks/block';
import { renderButtonBlock } from './blocks/button';
import { renderColumnBlock } from './blocks/column';
import { renderColumnsBlock } from './blocks/columns';
import { renderContainerBlock } from './blocks/container';
import { renderListBlock } from './blocks/list';
import { renderQuoteBlock } from './blocks/quote';
import { renderRootBlock } from './blocks/root';
import { renderSocialIconsBlock } from './blocks/social-icons';
import { renderTextBlock } from './blocks/text';
// Style converters
import { convertAccessibilityProps } from './styles/accessibility';
import { convertLayoutProps } from './styles/layout';
import { convertLinkProps } from './styles/link';
import { convertSizeProps } from './styles/size';
import { convertStyleProps } from './styles/styles';
import { convertTypographyProps } from './styles/typography';

// Utils
import { BLOCK_TYPE_TO_MJML_TAG, REQUIRES_COLUMN } from './utils/constants';

export type MjmlConversionResult = {
	mjml: string;
	warnings: string[];
	errors: string[];
};

export type HtmlConversionResult = {
	html: string;
	mjml: string;
	warnings: string[];
	errors: string[];
};

function convertPropsToMjmlAttributes(
	blockType: string,
	props: Record<string, unknown>
): string[] {
	const attrs: string[] = [];

	// Combine all style converters
	attrs.push(...convertAccessibilityProps(props));
	attrs.push(...convertLayoutProps(blockType, props));
	attrs.push(...convertLinkProps(props));
	attrs.push(...convertSizeProps(blockType, props));
	attrs.push(...convertStyleProps(blockType, props));
	attrs.push(...convertTypographyProps(props));

	return attrs;
}

function getBlockInnerContent(block: BlockIR): string {
	switch (block.type) {
		case 'Text':
		case 'Heading':
			return renderTextBlock(block);

		case 'Button':
			return renderButtonBlock(block);

		case 'List':
			return renderListBlock(block);

		case 'Quote':
			return renderQuoteBlock(block);

		case 'SocialIcons':
			return '';

		default:
			return '';
	}
}

function shouldHaveChildren(blockType: string): boolean {
	const containerTypes = ['Root', 'Container', 'Block', 'Columns', 'Column'];
	return containerTypes.includes(blockType);
}

function convertRootBlock(
	block: BlockIR,
	warnings: string[],
	errors: string[]
): string {
	const childrenMjml = (block.children || []).map((child: BlockIR) => {
		const isSectionLevel =
			child.type === 'Container' ||
			child.type === 'Block' ||
			child.type === 'Columns';

		if (isSectionLevel) {
			return convertBlockToMjml(child, warnings, errors);
		}

		if (REQUIRES_COLUMN.includes(child.type)) {
			const childMjml = convertBlockToMjml(child, warnings, errors);
			return `<mj-section padding="0"><mj-column>${childMjml}</mj-column></mj-section>`;
		}

		return convertBlockToMjml(child, warnings, errors);
	});

	return renderRootBlock(block, childrenMjml);
}

function convertContainerTypeBlock(
	block: BlockIR,
	warnings: string[],
	errors: string[]
): string {
	const attrs = convertPropsToMjmlAttributes(block.type, block.props);
	const attrStr = attrs.join(' ');

	const childrenMjml = (block.children || []).map((child: BlockIR) =>
		convertBlockToMjml(child, warnings, errors)
	);

	if (block.type === 'Container') {
		return renderContainerBlock(attrStr, childrenMjml);
	}

	if (block.type === 'Block') {
		return renderBlockBlock(block, attrStr, childrenMjml, block.children || []);
	}

	if (block.type === 'Columns') {
		return renderColumnsBlock(block, attrStr, childrenMjml, warnings);
	}

	return renderColumnBlock(attrStr, childrenMjml);
}

function convertSocialIconsBlock(block: BlockIR): string {
	const tableHtml = renderSocialIconsBlock(block);
	if (!tableHtml) return '';

	const align = (block.props.align as string) || 'center';
	const mjmlAlign =
		align === 'flex-start' ? 'left' : align === 'flex-end' ? 'right' : 'center';

	const padding = block.props.padding;
	let paddingStr = 'padding="0"';
	if (typeof padding === 'number') {
		paddingStr = `padding="${padding}px"`;
	} else if (typeof padding === 'object' && padding !== null) {
		const p = padding as {
			top?: number;
			right?: number;
			bottom?: number;
			left?: number;
		};
		const top = p.top ?? 0;
		const right = p.right ?? 0;
		const bottom = p.bottom ?? 0;
		const left = p.left ?? 0;
		paddingStr = `padding="${top}px ${right}px ${bottom}px ${left}px"`;
	}

	return `<mj-text align="${mjmlAlign}" ${paddingStr}>${tableHtml}</mj-text>`;
}

function convertBlockWithChildren(
	block: BlockIR,
	mjmlTag: string,
	attrStr: string,
	warnings: string[],
	errors: string[]
): string {
	const childrenMjml = (block.children || [])
		.map((child: BlockIR) => convertBlockToMjml(child, warnings, errors))
		.filter((mjml: string) => mjml.length > 0)
		.join('\n');

	if (childrenMjml.length > 0) {
		return `<${mjmlTag}${attrStr}>\n${childrenMjml}\n</${mjmlTag}>`;
	}
	return `<${mjmlTag}${attrStr}></${mjmlTag}>`;
}

function convertBlockToMjml(
	block: BlockIR,
	warnings: string[],
	errors: string[]
): string {
	if (block.type === 'Root') {
		return convertRootBlock(block, warnings, errors);
	}

	if (
		block.type === 'Container' ||
		block.type === 'Block' ||
		block.type === 'Columns' ||
		block.type === 'Column'
	) {
		return convertContainerTypeBlock(block, warnings, errors);
	}

	if (block.type === 'SocialIcons') {
		return convertSocialIconsBlock(block);
	}

	const mjmlTag = BLOCK_TYPE_TO_MJML_TAG[block.type];

	if (!mjmlTag) {
		errors.push(`Unknown block type: ${block.type}`);
		return '';
	}

	const attrs = convertPropsToMjmlAttributes(block.type, block.props);
	const attrStr = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';

	const innerContent = getBlockInnerContent(block);

	if (shouldHaveChildren(block.type)) {
		return convertBlockWithChildren(block, mjmlTag, attrStr, warnings, errors);
	}

	if (innerContent.length > 0) {
		return `<${mjmlTag}${attrStr}>${innerContent}</${mjmlTag}>`;
	}

	return `<${mjmlTag}${attrStr} />`;
}

export function convertDocumentToMjml(
	document: Document
): MjmlConversionResult {
	const warnings: string[] = [];
	const errors: string[] = [];

	if (!document?.root) {
		errors.push('Invalid document: missing root');
		return { mjml: '', warnings, errors };
	}

	try {
		const mjml = convertBlockToMjml(document.root, warnings, errors);
		return { mjml, warnings, errors };
	} catch (error) {
		errors.push(
			`Failed to convert document to MJML: ${error instanceof Error ? error.message : String(error)}`
		);
		return { mjml: '', warnings, errors };
	}
}

export function convertDocumentToHtml(
	document: Document
): HtmlConversionResult {
	const result = convertDocumentToMjml(document);

	if (result.errors.length > 0 || !result.mjml) {
		return {
			html: '',
			mjml: result.mjml,
			warnings: result.warnings,
			errors: result.errors,
		};
	}

	try {
		const mjmlResult = mjml2html(result.mjml, {
			validationLevel: 'soft',
			minify: false,
		});

		const allWarnings = [
			...result.warnings,
			...mjmlResult.errors.map((err) => err.formattedMessage),
		];

		return {
			html: mjmlResult.html,
			mjml: result.mjml,
			warnings: allWarnings,
			errors: result.errors,
		};
	} catch (error) {
		result.errors.push(
			`Failed to compile MJML to HTML: ${error instanceof Error ? error.message : String(error)}`
		);
		return {
			html: '',
			mjml: result.mjml,
			warnings: result.warnings,
			errors: result.errors,
		};
	}
}
