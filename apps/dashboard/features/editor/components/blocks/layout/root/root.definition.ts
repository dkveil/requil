import type { ComponentDefinition } from '@requil/types/editor';
import { stylesGroup } from '../../../../registry/field-groups';

export const RootDefinition: ComponentDefinition = {
	type: 'Root',
	category: 'layout',
	name: 'Root',
	description: 'Email root container',
	icon: 'Mail',
	isHidden: true,

	allowedChildren: ['Container', 'Section', 'Block'],
	minChildren: 0,

	propsSchema: {
		type: 'object',
		properties: {
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...stylesGroup.defaults,
		fill: { color: '#ffffff' },
	},

	inspectorConfig: {
		groups: [stylesGroup.inspectorGroup],
		fields: [...stylesGroup.inspectorFields],
	},
};
