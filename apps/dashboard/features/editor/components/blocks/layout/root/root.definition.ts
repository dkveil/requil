import type { ComponentDefinition } from '@requil/types/editor';
import {
	createFieldGroup,
	fillFields,
	marginFields,
	paddingFields,
} from '../../../../registry/field-groups';

const rootStylesGroup = createFieldGroup({
	id: 'rootStyles',
	label: 'Styles',
	fields: {
		...fillFields,
	},
});

const layoutGroup = createFieldGroup({
	id: 'layout',
	label: 'Layout',
	fields: {
		...paddingFields,
		...marginFields,
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
		bodyFill: { color: '#ffffff' },
	},

	inspectorConfig: {
		groups: [rootStylesGroup.inspectorGroup, layoutGroup.inspectorGroup],
		fields: [
			...rootStylesGroup.inspectorFields,
			...layoutGroup.inspectorFields,
		],
	},
};
