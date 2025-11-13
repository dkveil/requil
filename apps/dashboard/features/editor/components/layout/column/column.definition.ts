import type { ComponentDefinition } from '@requil/types/editor';

export const ColumnDefinition: ComponentDefinition = {
	type: 'Column',
	category: 'layout',
	name: 'Column',
	description: 'Single column within Columns',
	icon: 'Box',
	isHidden: true, // Don't show in palette - created automatically

	allowedChildren: ['Text', 'Heading', 'Button', 'Image', 'Spacer', 'Divider'],
	allowedParents: ['Columns'],

	propsSchema: {
		type: 'object',
		properties: {
			width: { type: 'string', default: 'auto' }, // "50%", "200px", "auto"
			backgroundColor: { type: 'string' },
			paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 10 },
			paddingBottom: {
				type: 'number',
				minimum: 0,
				maximum: 100,
				default: 10,
			},
			paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 10 },
			paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 10 },
			borderWidth: { type: 'number', minimum: 0, maximum: 20, default: 0 },
			borderColor: { type: 'string', default: '#DDDDDD' },
			borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 0 },
		},
	},

	defaultProps: {
		width: 'auto',
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 10,
		paddingRight: 10,
	},

	inspectorConfig: {
		groups: [
			{ id: 'layout', label: 'Layout', fields: ['width'] },
			{
				id: 'spacing',
				label: 'Spacing',
				fields: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
			},
			{
				id: 'style',
				label: 'Style',
				fields: [
					'backgroundColor',
					'borderWidth',
					'borderColor',
					'borderRadius',
				],
			},
		],
		fields: [
			{
				key: 'width',
				label: 'Width',
				type: 'text',
				placeholder: 'auto, 50%, 200px',
			},
			{ key: 'backgroundColor', label: 'Background', type: 'color' },
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
			{
				key: 'borderWidth',
				label: 'Border',
				type: 'number',
				min: 0,
				max: 20,
			},
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

	mjmlTag: 'mj-column',
};
