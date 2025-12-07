import { ComponentDefinition } from '@requil/types';
import {
	getLayoutGroup,
	stylesGroup,
	typographyGroup,
} from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';

const layoutGroup = getLayoutGroup();

export const textGroup = createFieldGroup({
	id: 'text',
	label: 'Text',
	fields: {
		content: {
			schema: {
				type: 'string',
				default: 'Start typing here...',
			},
			field: {
				key: 'content',
				label: 'Content',
				type: 'textarea',
				placeholder: 'Text content',
			},
		},
	},
});

export const TextDefinition: ComponentDefinition = {
	type: 'Text',
	category: 'content',
	name: 'Text',
	description: 'Paragraph of text',
	icon: 'Type',

	allowedChildren: [],
	allowedParents: ['Root', 'Container', 'Section'],

	propsSchema: {
		type: 'object',
		properties: {
			...textGroup.schema,
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...textGroup.defaults,
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		fontSize: 16,
		lineHeight: 1.5,
		textAlign: 'left',
		color: '#000000',
	},

	inspectorConfig: {
		groups: [
			textGroup.inspectorGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...textGroup.inspectorFields,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
