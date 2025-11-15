import type { ComponentDefinition } from '@requil/types/editor';
import {
	accessibilityGroup,
	layoutGroup,
	linkGroup,
	sizeGroup,
	stylesGroup,
} from '../../../registry/field-groups';

export const BlockDefinition: ComponentDefinition = {
	type: 'Block',
	category: 'layout',
	name: 'Block',
	description: 'Full-width block for content grouping',
	icon: 'Box',

	allowedChildren: [
		'Columns',
		'Text',
		'Heading',
		'Button',
		'Image',
		'Spacer',
		'Divider',
	],
	allowedParents: ['Container'],

	propsSchema: {
		type: 'object',
		properties: {
			...linkGroup.schema,
			...sizeGroup.schema,
			...layoutGroup.schema,
			...accessibilityGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...linkGroup.defaults,
		...sizeGroup.defaults,
		...layoutGroup.defaults,
		...accessibilityGroup.defaults,
		...stylesGroup.defaults,
	},

	inspectorConfig: {
		groups: [
			linkGroup.inspectorGroup,
			sizeGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
			accessibilityGroup.inspectorGroup,
		],
		fields: [
			...linkGroup.inspectorFields,
			...sizeGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
			...accessibilityGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-section',
};
