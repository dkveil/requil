import type { ComponentDefinition } from '@requil/types/editor';
import {
	accessibilityGroup,
	layoutGroup,
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
			...sizeGroup.schema,
			...layoutGroup.schema,
			...accessibilityGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...sizeGroup.defaults,
		...layoutGroup.defaults,
		...accessibilityGroup.defaults,
		...stylesGroup.defaults,
	},

	inspectorConfig: {
		groups: [
			sizeGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
			accessibilityGroup.inspectorGroup,
		],
		fields: [
			...sizeGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
			...accessibilityGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-section',
};
