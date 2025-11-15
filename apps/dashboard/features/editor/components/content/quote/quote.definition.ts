import type { ComponentDefinition, InspectorField } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '../../../registry/field-groups';

export const quoteFields: InspectorField[] = [
	{
		key: 'text',
		label: 'Text',
		type: 'textarea',
		rows: 4,
		placeholder: 'Enter quote text...',
	},
	{
		key: 'citation',
		label: 'Citation',
		type: 'text',
		placeholder: 'Author or source',
	},
];

const quoteContentGroup = {
	id: 'content',
	label: 'Quote',
	fields: ['text', 'citation'],
};

export const QuoteDefinition: ComponentDefinition = {
	type: 'Quote',
	category: 'content',
	name: 'Quote',
	description: 'A blockquote with optional citation',
	allowedParents: ['Container', 'Block', 'Column'],

	propsSchema: {
		type: 'object',
		properties: {
			text: {
				type: 'string',
				default: 'This is a quote.',
			},
			citation: {
				type: 'string',
				default: '',
			},
			...layoutGroup.schema,
			...typographyGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		text: 'This is a quote.',
		citation: '',
		...layoutGroup.defaults,
		...typographyGroup.defaults,
		...stylesGroup.defaults,
		padding: {
			top: 12,
			right: 0,
			bottom: 12,
			left: 16,
		},
		fontStyle: 'italic',
	},

	inspectorConfig: {
		groups: [
			quoteContentGroup,
			layoutGroup.inspectorGroup,
			typographyGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...quoteFields,
			...layoutGroup.inspectorFields,
			...typographyGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-text',
};
