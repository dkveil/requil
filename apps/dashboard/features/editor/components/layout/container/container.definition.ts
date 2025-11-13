import type { ComponentDefinition } from '@requil/types/editor';
import {
	layoutGroup,
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
		padding: 20,
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

	mjmlTag: 'mj-wrapper',
};
