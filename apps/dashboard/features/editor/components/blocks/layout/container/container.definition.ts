import { ComponentDefinition } from '@requil/types/editor';

export const ContainerDefinition: ComponentDefinition = {
	type: 'Container',
	category: 'layout',
	name: 'Container',
	description: 'Section container for grouping content',
	icon: 'Square',

	allowedChildren: [],
	allowedParents: ['Root'],

	propsSchema: {
		type: 'object',
		properties: {
			fullWidth: { type: 'boolean', default: true },
		},
	},

	defaultProps: {
		fullWidth: true,
	},

	inspectorConfig: {
		groups: [
			{
				id: 'layout',
				label: 'Layout',
				fields: ['fullWidth'],
			},
		],
		fields: [
			{
				key: 'fullWidth',
				label: 'Full Width',
				type: 'toggle',
			},
		],
	},
};
