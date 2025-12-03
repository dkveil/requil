import type { ComponentDefinition } from '@requil/types/editor';
import {
	borderFields,
	createFieldGroup,
	fillFields,
} from '../../../../registry/field-groups';

const rootStylesGroup = createFieldGroup({
	id: 'rootStyles',
	label: 'Styles',
	fields: {
		...fillFields,
		...borderFields,
	},
});

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
			...rootStylesGroup.schema,
		},
	},

	defaultProps: {
		...rootStylesGroup.defaults,
		fill: { color: '#ffffff' },
	},

	inspectorConfig: {
		groups: [rootStylesGroup.inspectorGroup],
		fields: [...rootStylesGroup.inspectorFields],
	},
};
