import type { ComponentDefinition } from '@requil/types/editor';
import { sizeGroup, stylesGroup } from '../../../registry/field-groups';

export const ColumnDefinition: ComponentDefinition = {
	type: 'Column',
	category: 'layout',
	name: 'Column',
	description: 'Single column within Columns',
	icon: 'Box',
	isHidden: true, // Don't show in palette - created automatically

	allowedChildren: ['Text', 'Heading', 'Button', 'Image', 'Spacer', 'Divider'],
	allowedParents: ['Columns'],

	propsSchema: {
		type: 'object',
		properties: {
			...sizeGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...sizeGroup.defaults,
		...stylesGroup.defaults,
		width: 'auto',
	},

	inspectorConfig: {
		groups: [sizeGroup.inspectorGroup, stylesGroup.inspectorGroup],
		fields: [...sizeGroup.inspectorFields, ...stylesGroup.inspectorFields],
	},

	mjmlTag: 'mj-column',
};
