import { ComponentDefinition } from '@requil/types/editor';
import { sizeGroup } from '../../../../registry/field-groups/size';

export const ContainerDefinition: ComponentDefinition = {
	type: 'Container',
	category: 'layout',
	name: 'Container',
	description: 'Section container for grouping content',
	icon: 'Square',

	allowedChildren: ['Container'],
	allowedParents: ['Root'],

	propsSchema: {
		type: 'object',
		properties: {
			...sizeGroup.schema,
		},
	},

	defaultProps: {
		fullWidth: true,
		...sizeGroup.defaults,
	},

	inspectorConfig: {
		groups: [sizeGroup.inspectorGroup],
		fields: [...sizeGroup.inspectorFields],
	},
};
