import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';

export const headingGroup = createFieldGroup({
	id: 'heading',
	label: 'Heading',
	fields: {
		content: {
			schema: {
				type: 'string',
				default: 'Your heading text',
			},
			field: {
				key: 'content',
				label: 'Content',
				type: 'text',
				placeholder: 'Heading content',
			},
		},
		level: {
			schema: {
				type: 'string',
				enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
				default: 'h1',
			},
			field: {
				key: 'level',
				label: 'Level',
				type: 'select',
				options: [
					{ label: 'H1', value: 'h1' },
					{ label: 'H2', value: 'h2' },
					{ label: 'H3', value: 'h3' },
					{ label: 'H4', value: 'h4' },
					{ label: 'H5', value: 'h5' },
					{ label: 'H6', value: 'h6' },
				],
				defaultValue: 'h1',
			},
		},
	},
});

export const HeadingDefinition: ComponentDefinition = {
	type: 'Heading',
	category: 'content',
	name: 'Heading',
	description: 'Heading for content',
	icon: 'Heading',

	allowedChildren: [],
	allowedParents: ['Root', 'Container', 'Section'],

	propsSchema: {
		type: 'object',
		properties: {
			...headingGroup.schema,
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...headingGroup.defaults,
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		margin: 0,
		fontSize: 32,
		fontWeight: '700',
	},

	inspectorConfig: {
		groups: [
			headingGroup.inspectorGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...headingGroup.inspectorFields,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
