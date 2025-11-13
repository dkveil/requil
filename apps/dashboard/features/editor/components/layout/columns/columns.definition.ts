import type { ComponentDefinition } from '@requil/types/editor';

export const ColumnsDefinition: ComponentDefinition = {
	type: 'Columns',
	category: 'layout',
	name: 'Columns',
	description: 'Multi-column layout container',
	icon: 'Columns2',

	allowedChildren: ['Column'],
	allowedParents: ['Container', 'Section'],
	minChildren: 1,
	maxChildren: 4,

	propsSchema: {
		type: 'object',
		properties: {
			columnCount: { type: 'number', minimum: 1, maximum: 4, default: 2 },
			gap: { type: 'number', minimum: 0, maximum: 50, default: 0 },
			stackOnMobile: { type: 'boolean', default: true },
			verticalAlign: { enum: ['top', 'middle', 'bottom'], default: 'top' },
		},
	},

	defaultProps: {
		columnCount: 2,
		gap: 0,
		stackOnMobile: true,
		verticalAlign: 'top',
	},

	inspectorConfig: {
		fields: [
			{
				key: 'columnCount',
				label: 'Columns',
				type: 'select',
				options: [
					{ label: '1 Column', value: 1 },
					{ label: '2 Columns', value: 2 },
					{ label: '3 Columns', value: 3 },
					{ label: '4 Columns', value: 4 },
				],
			},
			{ key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 50 },
			{ key: 'stackOnMobile', label: 'Stack on Mobile', type: 'toggle' },
			{
				key: 'verticalAlign',
				label: 'Vertical Align',
				type: 'select',
				options: [
					{ label: 'Top', value: 'top' },
					{ label: 'Middle', value: 'middle' },
					{ label: 'Bottom', value: 'bottom' },
				],
			},
		],
	},

	mjmlTag: 'mj-group',
};
