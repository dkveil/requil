import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '../../../registry/field-groups';

const contentField = {
	key: 'content',
	label: 'Content',
	type: 'textarea' as const,
	placeholder: 'Enter your text here...',
};

const contentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['content'],
};

export const TextDefinition: ComponentDefinition = {
	type: 'Text',
	category: 'content',
	name: 'Text',
	description: 'Basic text block',
	icon: 'Type',

	allowedParents: ['Section', 'Column', 'Block'],

	propsSchema: {
		type: 'object',
		properties: {
			content: { type: 'string', default: 'Enter your text here...' },
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		content: 'Enter your text here...',
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
	},

	inspectorConfig: {
		groups: [
			contentGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			contentField,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-text',
};
