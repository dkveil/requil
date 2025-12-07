import { ComponentDefinition } from '@requil/types/editor';
import {
	getLayoutGroup,
	sizeGroup,
	stylesGroup,
} from '@/features/editor/registry/field-groups';

const layoutGroup = getLayoutGroup({ verticalAlign: true });

export const SectionDefinition: ComponentDefinition = {
	type: 'Section',
	category: 'layout',
	name: 'Section',
	description: 'Section for grouping content',
	icon: 'Columns2',

	allowedChildren: [
		'Section',
		'Divider',
		'Heading',
		'Text',
		'Link',
		'Image',
		'Button',
	],
	allowedParents: ['Root', 'Container', 'Section'],

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
