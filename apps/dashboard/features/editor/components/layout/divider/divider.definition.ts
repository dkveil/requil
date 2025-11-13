import type { ComponentDefinition } from '@requil/types/editor';

export const DividerDefinition: ComponentDefinition = {
	type: 'Divider',
	category: 'layout',
	name: 'Divider',
	description: 'Horizontal line separator',
	icon: 'Minus',
	isVoid: true,

	allowedParents: ['Container', 'Section', 'Column'],

	propsSchema: {
		type: 'object',
		properties: {
			thickness: { type: 'number', minimum: 1, maximum: 10, default: 1 },
			color: { type: 'string', default: '#DDDDDD' },
			style: { enum: ['solid', 'dashed', 'dotted'], default: 'solid' },
			width: { type: 'string', default: '100%' },
			paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 10 },
			paddingBottom: {
				type: 'number',
				minimum: 0,
				maximum: 100,
				default: 10,
			},
		},
	},

	defaultProps: {
		thickness: 1,
		color: '#DDDDDD',
		style: 'solid',
		width: '100%',
		paddingTop: 10,
		paddingBottom: 10,
	},

	inspectorConfig: {
		groups: [
			{
				id: 'style',
				label: 'Style',
				fields: ['thickness', 'color', 'style', 'width'],
			},
			{
				id: 'spacing',
				label: 'Spacing',
				fields: ['paddingTop', 'paddingBottom'],
			},
		],
		fields: [
			{
				key: 'thickness',
				label: 'Thickness (px)',
				type: 'slider',
				min: 1,
				max: 10,
			},
			{ key: 'color', label: 'Color', type: 'color' },
			{
				key: 'style',
				label: 'Style',
				type: 'select',
				options: [
					{ label: 'Solid', value: 'solid' },
					{ label: 'Dashed', value: 'dashed' },
					{ label: 'Dotted', value: 'dotted' },
				],
			},
			{
				key: 'width',
				label: 'Width',
				type: 'text',
				placeholder: '100%, 50%, 300px',
			},
			{
				key: 'paddingTop',
				label: 'Top Padding',
				type: 'number',
				min: 0,
				max: 100,
			},
			{
				key: 'paddingBottom',
				label: 'Bottom Padding',
				type: 'number',
				min: 0,
				max: 100,
			},
		],
	},

	mjmlTag: 'mj-divider',
};
