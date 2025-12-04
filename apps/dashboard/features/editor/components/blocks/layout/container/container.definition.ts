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
		properties: {},
	},

	defaultProps: {
		fullWidth: true,
	},

	inspectorConfig: {
		groups: [],
		fields: [],
	},
};
