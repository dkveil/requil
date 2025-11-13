import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '../../../registry/field-groups';

const headingFields = [
	{
		key: 'content',
		label: 'Content',
		type: 'text' as const,
		placeholder: 'Your Heading',
	},
	{
		key: 'level',
		label: 'Level',
		type: 'select' as const,
		options: [
			{ label: 'H1', value: 'h1' },
			{ label: 'H2', value: 'h2' },
			{ label: 'H3', value: 'h3' },
			{ label: 'H4', value: 'h4' },
			{ label: 'H5', value: 'h5' },
			{ label: 'H6', value: 'h6' },
		],
	},
];

const headingContentGroup = {
	id: 'content',
	label: 'Heading',
	fields: ['content', 'level'],
};

export const HeadingDefinition: ComponentDefinition = {
	type: 'Heading',
	category: 'content',
	name: 'Heading',
	description: 'Heading text (H1-H6)',
	icon: 'Heading',

	allowedParents: ['Section', 'Column', 'Block'],

	propsSchema: {
		type: 'object',
		properties: {
			content: { type: 'string', default: 'Your Heading' },
			level: {
				type: 'string',
				enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
				default: 'h2',
			},
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		content: 'Your Heading',
		level: 'h2',
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		fontSize: 32,
		fontWeight: '700',
	},

	inspectorConfig: {
		groups: [
			headingContentGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...headingFields,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-text',
};
