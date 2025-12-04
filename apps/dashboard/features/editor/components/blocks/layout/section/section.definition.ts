import { ComponentDefinition } from '@requil/types/editor';

export const SectionDefinition: ComponentDefinition = {
	type: 'Section',
	category: 'layout',
	name: 'Section',
	description: 'Section for grouping content',
	icon: 'Columns2',

	allowedChildren: ['Section'],
	allowedParents: ['Root', 'Container'],

	propsSchema: {},

	defaultProps: {},

	inspectorConfig: {
		groups: [],
		fields: [],
	},
};
