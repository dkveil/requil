import type { ComponentDefinition } from '@requil/types/editor';

export const BlockDefinition: ComponentDefinition = {
	type: 'Block',
	category: 'layout',
	name: 'Block',
	description: 'Full-width block for content grouping',
	icon: 'Box',

	allowedChildren: [
		'Columns',
		'Text',
		'Heading',
		'Button',
		'Image',
		'Spacer',
		'Divider',
	],
	allowedParents: ['Container'],

	propsSchema: {
		type: 'object',
		properties: {
			htmlTag: {
				enum: ['div', 'section', 'article', 'header', 'footer', 'main', 'nav'],
				default: 'div',
			},
			ariaLabel: {
				type: 'string',
				default: '',
				placeholder: 'Enter aria label',
			},
			fullWidth: { type: 'boolean', default: true },
			backgroundColor: { type: 'string', default: '#FFFFFF' },
			backgroundImage: { type: 'string' },
			backgroundSize: {
				enum: ['cover', 'contain', 'auto'],
				default: 'cover',
			},
			backgroundPosition: { type: 'string', default: 'center center' },
			paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 20 },
			paddingBottom: {
				type: 'number',
				minimum: 0,
				maximum: 100,
				default: 20,
			},
			paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 0 },
			paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 0 },
			borderWidth: { type: 'number', minimum: 0, maximum: 20, default: 0 },
			borderColor: { type: 'string', default: '#DDDDDD' },
			borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 0 },
		},
	},

	defaultProps: {
		htmlTag: 'div',
		ariaLabel: '',
		fullWidth: true,
		backgroundColor: '#FFFFFF',
		paddingTop: 20,
		paddingBottom: 20,
		paddingLeft: 0,
		paddingRight: 0,
	},

	inspectorConfig: {
		groups: [
			{
				id: 'accessibility',
				label: 'Accessibility',
				fields: ['htmlTag', 'ariaLabel'],
			},
			{
				id: 'background',
				label: 'Background',
				fields: [
					'backgroundColor',
					'backgroundImage',
					'backgroundSize',
					'backgroundPosition',
				],
			},
			{
				id: 'spacing',
				label: 'Spacing',
				fields: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
			},
			{
				id: 'borders',
				label: 'Borders',
				fields: ['borderWidth', 'borderColor', 'borderRadius'],
			},
		],
		fields: [
			{
				key: 'htmlTag',
				label: 'Tag',
				type: 'select',
				options: [
					{ label: 'div', value: 'div' },
					{ label: 'section', value: 'section' },
					{ label: 'article', value: 'article' },
					{ label: 'header', value: 'header' },
					{ label: 'footer', value: 'footer' },
					{ label: 'main', value: 'main' },
					{ label: 'nav', value: 'nav' },
				],
			},
			{
				key: 'ariaLabel',
				label: 'Aria Label',
				type: 'text',
				placeholder: 'Enter aria label',
			},
			{ key: 'backgroundColor', label: 'Background Color', type: 'color' },
			{ key: 'backgroundImage', label: 'Background Image', type: 'image' },
			{
				key: 'backgroundSize',
				label: 'Size',
				type: 'select',
				options: [
					{ label: 'Cover', value: 'cover' },
					{ label: 'Contain', value: 'contain' },
					{ label: 'Auto', value: 'auto' },
				],
			},
			{
				key: 'backgroundPosition',
				label: 'Position',
				type: 'text',
				placeholder: 'center center',
			},
			{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
			{
				key: 'paddingBottom',
				label: 'Bottom',
				type: 'number',
				min: 0,
				max: 100,
			},
			{ key: 'paddingLeft', label: 'Left', type: 'number', min: 0, max: 100 },
			{
				key: 'paddingRight',
				label: 'Right',
				type: 'number',
				min: 0,
				max: 100,
			},
			{ key: 'borderWidth', label: 'Width', type: 'number', min: 0, max: 20 },
			{ key: 'borderColor', label: 'Color', type: 'color' },
			{
				key: 'borderRadius',
				label: 'Radius',
				type: 'slider',
				min: 0,
				max: 50,
			},
		],
	},

	mjmlTag: 'mj-section',
};
