import { ComponentDefinition } from '@requil/types/editor';
import {
	layoutGroup,
	sizeGroup,
	stylesGroup,
} from '@/features/editor/registry/field-groups';

export const ContainerDefinition: ComponentDefinition = {
	type: 'Container',
	category: 'layout',
	name: 'Container',
	description: 'Section container for grouping content',
	icon: 'Square',

	allowedChildren: ['Container', 'Section', 'Heading', 'Text'],
	allowedParents: ['Root', 'Container'],

	propsSchema: {
		type: 'object',
		properties: {
			...sizeGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...sizeGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		maxWidth: '600px',
		margin: {
			top: 0,
			right: 'auto',
			bottom: 0,
			left: 'auto',
		},
	},

	inspectorConfig: {
		groups: [
			sizeGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...sizeGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
