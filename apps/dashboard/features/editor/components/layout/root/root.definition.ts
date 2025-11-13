import type { ComponentDefinition } from '@requil/types/editor';

export const RootDefinition: ComponentDefinition = {
	type: 'Root',
	category: 'layout',
	name: 'Root',
	description: 'Root container for the entire document',
	icon: 'Root',
	isHidden: true, // Hide from Elements Sidebar

	allowedChildren: ['Container', 'Section', 'Columns', 'Spacer', 'Divider'],
	minChildren: 0,

	propsSchema: {
		type: 'object',
		properties: {
			backgroundColor: { type: 'string', default: '#F4F4F5' },
		},
	},

	defaultProps: {
		backgroundColor: '#F4F4F5',
	},

	inspectorConfig: {
		groups: [
			{
				id: 'style',
				label: 'Style',
				fields: ['backgroundColor'],
			},
		],
		fields: [
			{ key: 'backgroundColor', label: 'Background Color', type: 'color' },
		],
	},

	mjmlTag: 'mjml',
};
