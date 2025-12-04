import { ComponentDefinition } from '@requil/types/editor';
import { layoutGroup } from '../../../../registry/field-groups/layout';
import { sizeGroup } from '../../../../registry/field-groups/size';

export const ContainerDefinition: ComponentDefinition = {
	type: 'Container',
	category: 'layout',
	name: 'Container',
	description: 'Section container for grouping content',
	icon: 'Square',

	allowedChildren: ['Container'],
	allowedParents: ['Root', 'Container'],

	propsSchema: {
		type: 'object',
		properties: {
			...sizeGroup.schema,
			...layoutGroup.schema,
		},
	},

	defaultProps: {
		fullWidth: true,
		...sizeGroup.defaults,
		...layoutGroup.defaults,
	},

	inspectorConfig: {
		groups: [sizeGroup.inspectorGroup, layoutGroup.inspectorGroup],
		fields: [...sizeGroup.inspectorFields, ...layoutGroup.inspectorFields],
	},
};
