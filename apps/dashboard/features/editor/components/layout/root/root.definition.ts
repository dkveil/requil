import type { ComponentDefinition, InspectorField } from '@requil/types/editor';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';
import { fillFields } from '@/features/editor/registry/field-groups/styles';

export const createRootStylesGroup = createFieldGroup({
	id: 'Styles',
	label: 'Styles',
	fields: {
		fill: {
			schema: {
				type: 'object',
				default: {
					color: '#F4F4F5',
				},
			},
			field: {
				...(fillFields.fill?.field as InspectorField),
			},
		},
	},
});

export const RootDefinition: ComponentDefinition = {
	type: 'Root',
	category: 'layout',
	name: 'Root',
	description: 'Root container for the entire document',
	icon: 'Root',
	isHidden: true, // Hide from Elements Sidebar

	allowedChildren: ['Container', 'Section', 'Columns', 'Spacer', 'Divider'],
	minChildren: 0,

	propsSchema: {
		type: 'object',
		properties: {
			...createRootStylesGroup.schema,
		},
	},

	defaultProps: {
		...createRootStylesGroup.defaults,
	},

	inspectorConfig: {
		groups: [createRootStylesGroup.inspectorGroup],
		fields: [...createRootStylesGroup.inspectorFields],
	},

	mjmlTag: 'mjml',
};
