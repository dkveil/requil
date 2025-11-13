import type { ComponentDefinition } from '@requil/types/editor';

export const ContainerDefinition: ComponentDefinition = {
	type: 'Container',
	category: 'layout',
	name: 'Container',
	description: 'Main content wrapper with max-width constraint',
	icon: 'Container',

	allowedChildren: ['Section', 'Columns', 'Spacer', 'Divider'],
	minChildren: 0,

	propsSchema: {
		type: 'object',
		properties: {
			maxWidth: { type: 'number', minimum: 320, maximum: 800, default: 600 },
			fullWidth: { type: 'boolean', default: false },
			backgroundColor: { type: 'string', default: '#FFFFFF' },
			paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 20 },
			paddingBottom: {
				type: 'number',
				minimum: 0,
				maximum: 100,
				default: 20,
			},
			paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 10 },
			paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 10 },
		},
	},

	defaultProps: {
		maxWidth: 600,
		fullWidth: false,
		backgroundColor: '#FFFFFF',
		paddingTop: 20,
		paddingBottom: 20,
		paddingLeft: 10,
		paddingRight: 10,
	},

	inspectorConfig: {
		groups: [
			{
				id: 'layout',
				label: 'Layout',
				fields: ['maxWidth', 'fullWidth'],
			},
			{
				id: 'spacing',
				label: 'Spacing',
				fields: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
			},
			{
				id: 'style',
				label: 'Style',
				fields: ['backgroundColor'],
			},
		],
		fields: [
			{
				key: 'maxWidth',
				label: 'Max Width',
				type: 'slider',
				min: 320,
				max: 800,
				step: 10,
			},
			{ key: 'fullWidth', label: 'Full Width', type: 'toggle' },
			{ key: 'backgroundColor', label: 'Background Color', type: 'color' },
			{
				key: 'paddingTop',
				label: 'Top',
				type: 'number',
				min: 0,
				max: 100,
				group: 'spacing',
			},
			{
				key: 'paddingBottom',
				label: 'Bottom',
				type: 'number',
				min: 0,
				max: 100,
				group: 'spacing',
			},
			{
				key: 'paddingLeft',
				label: 'Left',
				type: 'number',
				min: 0,
				max: 100,
				group: 'spacing',
			},
			{
				key: 'paddingRight',
				label: 'Right',
				type: 'number',
				min: 0,
				max: 100,
				group: 'spacing',
			},
		],
	},

	mjmlTag: 'mj-wrapper',
};
