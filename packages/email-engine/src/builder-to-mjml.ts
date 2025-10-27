import type { BuilderElement, BuilderElementProperties } from '@requil/db';
import mjml2html from 'mjml';

type MjmlConversionResult = {
	mjml: string;
	warnings: string[];
};

type HtmlConversionResult = {
	html: string;
	mjml: string;
	warnings: string[];
};

const ELEMENT_TAG_MAP: Record<string, string> = {
	'layout:container': 'mj-wrapper',
	'layout:section': 'mj-section',
	'layout:column': 'mj-column',
	'layout:columns-2': 'mj-section',
	'layout:columns-3': 'mj-section',
	'layout:row': 'mj-group',
	'content:heading': 'mj-text',
	'content:paragraph': 'mj-text',
	'content:text': 'mj-text',
	'content:button': 'mj-button',
	'content:divider': 'mj-divider',
	'content:spacer': 'mj-spacer',
	'media:image': 'mj-image',
	'media:video': 'mj-text',
	'advanced:social-links': 'mj-social',
	'advanced:unsubscribe': 'mj-text',
	'advanced:custom': 'mj-raw',
};

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// ... existing code ...

type AttributeConverter = (properties: BuilderElementProperties) => string[];

function convertHeadingAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	const level = Number(properties.level) || 1;
	const fontSize = properties.fontSize || `${32 - (level - 1) * 4}px`;
	const color = properties.color || '#000000';
	const align = properties.align || 'left';

	attrs.push(`font-size="${fontSize}"`);
	attrs.push(`color="${color}"`);
	attrs.push(`align="${align}"`);

	if (properties.fontFamily)
		attrs.push(`font-family="${properties.fontFamily}"`);
	if (properties.fontWeight)
		attrs.push(`font-weight="${properties.fontWeight}"`);

	return attrs;
}

function convertTextAttributes(properties: BuilderElementProperties): string[] {
	const attrs: string[] = [];
	const fontSize = properties.fontSize || '16px';
	const color = properties.color || '#000000';
	const align = properties.align || 'left';
	const lineHeight = properties.lineHeight || '1.5';

	attrs.push(`font-size="${fontSize}"`);
	attrs.push(`color="${color}"`);
	attrs.push(`align="${align}"`);
	attrs.push(`line-height="${lineHeight}"`);

	if (properties.fontFamily)
		attrs.push(`font-family="${properties.fontFamily}"`);

	return attrs;
}

function convertButtonAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	const href = properties.href || properties.url || '#';
	const backgroundColor = properties.backgroundColor || '#007AFF';
	const color = properties.textColor || properties.color || '#ffffff';
	const borderRadius = properties.borderRadius || '4px';
	const padding = properties.padding || '12px 24px';

	attrs.push(`href="${href}"`);
	attrs.push(`background-color="${backgroundColor}"`);
	attrs.push(`color="${color}"`);
	attrs.push(`border-radius="${borderRadius}"`);
	attrs.push(`inner-padding="${padding}"`);

	if (properties.fontSize) attrs.push(`font-size="${properties.fontSize}"`);
	if (properties.fontWeight)
		attrs.push(`font-weight="${properties.fontWeight}"`);

	return attrs;
}

function convertDividerAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	const borderColor = properties.borderColor || properties.color || '#DDDDDD';
	const borderWidth = properties.borderWidth || properties.width || '1px';
	const padding = properties.padding || '10px 0';

	attrs.push(`border-color="${borderColor}"`);
	attrs.push(`border-width="${borderWidth}"`);
	attrs.push(`padding="${padding}"`);

	return attrs;
}

function convertSpacerAttributes(
	properties: BuilderElementProperties
): string[] {
	const height = properties.height || '20px';
	return [`height="${height}"`];
}

function convertImageAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	const src = properties.src || '';
	const alt = properties.alt || '';
	const width = properties.width || 'auto';
	const align = properties.align || 'center';

	attrs.push(`src="${src}"`);
	attrs.push(`alt="${alt}"`);
	if (width !== 'auto') attrs.push(`width="${width}"`);
	attrs.push(`align="${align}"`);
	if (properties.href) attrs.push(`href="${properties.href}"`);

	return attrs;
}

function convertSectionAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	if (properties.padding) attrs.push(`padding="${properties.padding}"`);
	if (properties.backgroundColor)
		attrs.push(`background-color="${properties.backgroundColor}"`);
	return attrs;
}

function convertContainerAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	if (properties.width) attrs.push(`width="${properties.width}"`);
	if (properties.backgroundColor)
		attrs.push(`background-color="${properties.backgroundColor}"`);
	return attrs;
}

function convertColumnAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	if (properties.width) attrs.push(`width="${properties.width}"`);
	if (properties.padding) attrs.push(`padding="${properties.padding}"`);
	if (properties.backgroundColor)
		attrs.push(`background-color="${properties.backgroundColor}"`);
	return attrs;
}

function convertGenericAttributes(
	properties: BuilderElementProperties
): string[] {
	const attrs: string[] = [];
	for (const [key, value] of Object.entries(properties)) {
		if (value !== undefined && value !== null) {
			attrs.push(`${key}="${value}"`);
		}
	}
	return attrs;
}

const ATTRIBUTE_CONVERTERS: Record<string, AttributeConverter> = {
	'content:heading': convertHeadingAttributes,
	'content:paragraph': convertTextAttributes,
	'content:text': convertTextAttributes,
	'content:button': convertButtonAttributes,
	'content:divider': convertDividerAttributes,
	'content:spacer': convertSpacerAttributes,
	'media:image': convertImageAttributes,
	'layout:section': convertSectionAttributes,
	'layout:container': convertContainerAttributes,
	'layout:column': convertColumnAttributes,
};

function convertPropertiesToAttributes(
	type: string,
	name: string,
	properties: BuilderElementProperties
): string {
	const key = `${type}:${name}`;
	const converter = ATTRIBUTE_CONVERTERS[key];

	const attrs = converter
		? converter(properties)
		: convertGenericAttributes(properties);

	return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

function getInnerContent(
	type: string,
	name: string,
	properties: BuilderElementProperties
): string {
	const key = `${type}:${name}`;

	switch (key) {
		case 'content:heading':
		case 'content:paragraph':
		case 'content:text':
			return escapeHtml(String(properties.content || ''));

		case 'content:button':
			return escapeHtml(String(properties.text || 'Click here'));

		case 'advanced:unsubscribe':
			return escapeHtml(
				String(
					properties.text || '<a href="{{unsubscribe_url}}">Unsubscribe</a>'
				)
			);

		case 'advanced:custom':
			return String(properties.html || properties.content || '');

		default:
			return '';
	}
}

function shouldHaveChildren(type: string, name: string): boolean {
	const containerElements = [
		'layout:container',
		'layout:section',
		'layout:column',
		'layout:columns-2',
		'layout:columns-3',
		'layout:row',
	];
	return containerElements.includes(`${type}:${name}`);
}

function handleSpecialLayouts(
	element: BuilderElement,
	warnings: string[]
): string {
	const key = `${element.type}:${element.name}`;

	if (key === 'layout:columns-2' || key === 'layout:columns-3') {
		const columnCount = key === 'layout:columns-2' ? 2 : 3;
		const attrs = convertPropertiesToAttributes(
			element.type,
			element.name,
			element.properties
		);

		if (!element.children || element.children.length === 0) {
			warnings.push(`${key} should have ${columnCount} children (columns)`);

			const columnWidth = `${Math.floor(100 / columnCount)}%`;
			return `<mj-section${attrs}>${Array.from({ length: columnCount })
				.map(() => `<mj-column width="${columnWidth}"></mj-column>`)
				.join('\n')}</mj-section>`;
		}

		const columns = element.children.slice(0, columnCount);
		const columnWidth = `${Math.floor(100 / columnCount)}%`;

		return `<mj-section${attrs}>${columns
			.map((child: BuilderElement) => {
				const childMjml = convertElementToMjml(child, warnings);
				if (childMjml.startsWith('<mj-column')) {
					return childMjml;
				}
				return `<mj-column width="${columnWidth}">${childMjml}</mj-column>`;
			})
			.join('\n')}</mj-section>`;
	}

	return '';
}

function convertElementToMjml(
	element: BuilderElement,
	warnings: string[]
): string {
	const key = `${element.type}:${element.name}`;
	const specialLayout = handleSpecialLayouts(element, warnings);
	if (specialLayout) return specialLayout;

	const mjmlTag = ELEMENT_TAG_MAP[key];
	if (!mjmlTag) {
		warnings.push(`Unknown element type: ${key}`);
		return '';
	}

	const attrs = convertPropertiesToAttributes(
		element.type,
		element.name,
		element.properties
	);
	const innerContent = getInnerContent(
		element.type,
		element.name,
		element.properties
	);

	if (shouldHaveChildren(element.type, element.name)) {
		if (!element.children || element.children.length === 0) {
			return `<${mjmlTag}${attrs}></${mjmlTag}>`;
		}

		const childrenMjml = element.children
			.map((child: BuilderElement) => convertElementToMjml(child, warnings))
			.filter((mjml: string) => mjml.length > 0)
			.join('\n');

		return `<${mjmlTag}${attrs}>\n${childrenMjml}\n</${mjmlTag}>`;
	}

	if (innerContent) {
		return `<${mjmlTag}${attrs}>${innerContent}</${mjmlTag}>`;
	}

	return `<${mjmlTag}${attrs} />`;
}

export function convertBuilderToMjml(
	structure: BuilderElement
): MjmlConversionResult {
	const warnings: string[] = [];

	const bodyContent = convertElementToMjml(structure, warnings);

	const fontFamily =
		(structure.properties?.fontFamily as string) || 'Inter, sans-serif';
	const backgroundColor =
		(structure.properties?.backgroundColor as string) || '#ffffff';

	const mjml = `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${fontFamily}" />
      <mj-text padding="0" />
      <mj-section padding="0" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="${backgroundColor}">
${bodyContent}
  </mj-body>
</mjml>`;

	return { mjml, warnings };
}

export function convertBuilderToHtml(
	structure: BuilderElement
): HtmlConversionResult {
	const conversionResult = convertBuilderToMjml(structure);
	const { html, errors } = mjml2html(conversionResult.mjml);

	const mjmlWarnings = (
		errors as Array<{ formattedMessage?: string; message?: string }>
	).map((e) => e.formattedMessage || e.message || 'MJML warning');

	return {
		html,
		mjml: conversionResult.mjml,
		warnings: [...conversionResult.warnings, ...mjmlWarnings],
	};
}
