/**
 * Mapping of BlockIR types to MJML tag names
 */
export const BLOCK_TYPE_TO_MJML_TAG: Record<string, string> = {
	Text: 'mj-text',
	Heading: 'mj-text',
	Button: 'mj-button',
	Image: 'mj-image',
	List: 'mj-text',
	Quote: 'mj-text',
	Spacer: 'mj-spacer',
	Divider: 'mj-divider',
};

/**
 * Block types that need src attribute
 */
export const REQUIRES_SRC = ['Image'];

/**
 * Block types that must be wrapped in mj-section > mj-column when placed directly under Root
 */
export const REQUIRES_COLUMN = [
	'Text',
	'Heading',
	'Button',
	'Image',
	'List',
	'Quote',
	'SocialIcons',
	'Spacer',
	'Divider',
];
