export type BuilderElementType = 'layout' | 'content' | 'media' | 'advanced';

export type BuilderLayoutElement =
	| 'container'
	| 'section'
	| 'column'
	| 'columns-2'
	| 'columns-3'
	| 'row';

export type BuilderContentElement =
	| 'heading'
	| 'paragraph'
	| 'text'
	| 'button'
	| 'divider'
	| 'spacer';

export type BuilderMediaElement = 'image' | 'video';

export type BuilderAdvancedElement = 'social-links' | 'unsubscribe' | 'custom';

export type BuilderElementName =
	| BuilderLayoutElement
	| BuilderContentElement
	| BuilderMediaElement
	| BuilderAdvancedElement;

export type BuilderElementProperties = Record<string, unknown>;

export type BuilderElement = {
	type: BuilderElementType;
	name: BuilderElementName;
	properties: BuilderElementProperties;
	children?: BuilderElement[];
};

export type BuilderStructure = BuilderElement;

export type BuilderElementTypeMap = {
	layout: BuilderLayoutElement;
	content: BuilderContentElement;
	media: BuilderMediaElement;
	advanced: BuilderAdvancedElement;
};

export const BUILDER_ELEMENT_NAMES: Record<
	BuilderElementType,
	readonly string[]
> = {
	layout: [
		'container',
		'section',
		'column',
		'columns-2',
		'columns-3',
		'row',
	] as const,
	content: [
		'heading',
		'paragraph',
		'text',
		'button',
		'divider',
		'spacer',
	] as const,
	media: ['image', 'video'] as const,
	advanced: ['social-links', 'unsubscribe', 'custom'] as const,
} as const;

export function isValidBuilderElement(
	type: BuilderElementType,
	name: string
): boolean {
	return BUILDER_ELEMENT_NAMES[type].includes(name);
}

export function getBuilderElementNames(
	type: BuilderElementType
): readonly string[] {
	return BUILDER_ELEMENT_NAMES[type];
}
