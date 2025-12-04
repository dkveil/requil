import type { ComponentDefinition } from '@requil/types/editor';
import {
	borderFields,
	createFieldGroup,
	fillFields,
	paddingFields,
} from '../../../../registry/field-groups';

const rootStylesGroup = createFieldGroup({
	id: 'rootStyles',
	label: 'Styles',
	fields: {
		...fillFields,
		...borderFields,
	},
});

const layoutGroup = createFieldGroup({
	id: 'layout',
	label: 'Layout',
	fields: {
		...paddingFields,
	},
});

export const RootDefinition: ComponentDefinition = {
	type: 'Root',
	category: 'layout',
	name: 'Root',
	description: 'Email root container',
	icon: 'Mail',
	isHidden: true,

	allowedChildren: ['Container'],
	minChildren: 0,

	propsSchema: {
		type: 'object',
		properties: {
			...rootStylesGroup.schema,
			...layoutGroup.schema,
		},
	},

	defaultProps: {
		...rootStylesGroup.defaults,
		...layoutGroup.defaults,
		fill: { color: '#ffffff' },
	},

	inspectorConfig: {
		groups: [rootStylesGroup.inspectorGroup, layoutGroup.inspectorGroup],
		fields: [
			...rootStylesGroup.inspectorFields,
			...layoutGroup.inspectorFields,
		],
	},
};
