import { ComponentDefinition } from '@requil/types/editor';
import { borderFields } from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';
import { marginFields } from '@/features/editor/registry/field-groups/layout';
import { sizeGroup } from '@/features/editor/registry/field-groups/size';

const dividerLayoutGroup = createFieldGroup({
	id: 'dividerLayout',
	label: 'Layout',
	fields: {
		...marginFields,
	},
});

const dividerStylesGroup = createFieldGroup({
	id: 'dividerStyles',
	label: 'Styles',
	fields: {
		...borderFields,
	},
});

export const DividerDefinition: ComponentDefinition = {
	type: 'Divider',
	category: 'content',
	name: 'Divider',
	description: 'Divider for separating content',
	icon: 'Divider',

	allowedChildren: [],
	allowedParents: ['Root', 'Container', 'Section'],

	propsSchema: {
		type: 'object',
		properties: {
			...dividerLayoutGroup.schema,
			...sizeGroup.schema,
			...dividerStylesGroup.schema,
		},
	},

	defaultProps: {
		...dividerLayoutGroup.defaults,
		...sizeGroup.defaults,
		...dividerStylesGroup.defaults,
		margin: {
			top: 10,
			right: 'auto',
			bottom: 10,
			left: 'auto',
		},
		border: {
			top: {
				width: 1,
				color: '#eaeaea',
				style: 'solid',
			},
		},
	},

	inspectorConfig: {
		groups: [dividerLayoutGroup.inspectorGroup, sizeGroup.inspectorGroup],
		fields: [
			...dividerLayoutGroup.inspectorFields,
			...sizeGroup.inspectorFields,
			...dividerStylesGroup.inspectorFields,
		],
	},
};
