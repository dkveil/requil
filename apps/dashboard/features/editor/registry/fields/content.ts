import type { InspectorField } from '@requil/types';

export const contentSchema = {
	content: { type: 'string', default: 'Enter your text here...' },
};

export const contentField: InspectorField = {
	key: 'content',
	label: 'Text Content',
	type: 'textarea',
	rows: 4,
};

export const headingContentSchema = {
	content: { type: 'string', default: 'Your Heading' },
	level: { enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], default: 'h2' },
};

export const headingContentFields: InspectorField[] = [
	{
		key: 'content',
		label: 'Heading Text',
		type: 'text',
	},
	{
		key: 'level',
		label: 'Level',
		type: 'select',
		options: [
			{ label: 'H1 (Largest)', value: 'h1' },
			{ label: 'H2', value: 'h2' },
			{ label: 'H3', value: 'h3' },
			{ label: 'H4', value: 'h4' },
			{ label: 'H5', value: 'h5' },
			{ label: 'H6 (Smallest)', value: 'h6' },
		],
	},
];

export const buttonSchema = {
	text: { type: 'string', default: 'Click Me' },
	href: { type: 'string', default: '#' },
};

export const buttonFields: InspectorField[] = [
	{
		key: 'text',
		label: 'Button Text',
		type: 'text',
	},
	{
		key: 'href',
		label: 'Link URL',
		type: 'text',
		placeholder: 'https://example.com',
	},
];

export const imageSchema = {
	src: {
		type: 'string',
		default: 'https://via.placeholder.com/600x300',
	},
	alt: { type: 'string', default: 'Image description' },
	href: { type: 'string' },
};

export const imageFields: InspectorField[] = [
	{
		key: 'src',
		label: 'Image URL',
		type: 'image',
		placeholder: 'https://example.com/image.jpg',
	},
	{
		key: 'alt',
		label: 'Alt Text',
		type: 'text',
		placeholder: 'Description for accessibility',
	},
	{
		key: 'href',
		label: 'Link URL (optional)',
		type: 'text',
		placeholder: 'https://example.com',
	},
];

export const contentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['content'],
};

export const headingContentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['content', 'level'],
};

export const buttonContentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['text', 'href'],
};

export const imageContentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['src', 'alt', 'href'],
};
