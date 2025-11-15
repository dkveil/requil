import type { ComponentDefinition } from '@requil/types/editor';
import {
	layoutGroup,
	linkGroup,
	sizeGroup,
	stylesGroup,
} from '../../../registry/field-groups';

export const ContainerDefinition: ComponentDefinition = {
	type: 'Container',
	category: 'layout',
	name: 'Container',
	description: 'Main content wrapper with max-width constraint',
	icon: 'Container',

	allowedChildren: ['Block', 'Section', 'Columns', 'Spacer', 'Divider'],
	minChildren: 0,

	propsSchema: {
		type: 'object',
		properties: {
			...linkGroup.schema,
			...sizeGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...linkGroup.defaults,
		...sizeGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		maxWidth: '600px',
		padding: 20,
	},

	inspectorConfig: {
		groups: [
			linkGroup.inspectorGroup,
			sizeGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...linkGroup.inspectorFields,
			...sizeGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-wrapper',
};
