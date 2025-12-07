import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';

export const linkGroup = createFieldGroup({
	id: 'link',
	label: 'Link',
	fields: {
		content: {
			schema: {
				type: 'string',
				default: 'Link text',
			},
			field: {
				key: 'content',
				label: 'Content',
				type: 'text',
				placeholder: 'Link text',
			},
		},
		href: {
			schema: {
				type: 'string',
				default: 'https://example.com',
			},
			field: {
				key: 'href',
				label: 'URL',
				type: 'text',
				placeholder: 'https://example.com',
			},
		},
		target: {
			schema: {
				type: 'string',
				enum: ['_blank', '_self'],
				default: '_blank',
			},
			field: {
				key: 'target',
				label: 'Target',
				type: 'select',
				options: [
					{ label: 'New Tab', value: '_blank' },
					{ label: 'Same Tab', value: '_self' },
				],
				defaultValue: '_blank',
			},
		},
	},
});

export const LinkDefinition: ComponentDefinition = {
	type: 'Link',
	category: 'content',
	name: 'Link',
	description: 'Hyperlink',
	icon: 'Link',

	allowedChildren: [],
	allowedParents: ['Root', 'Container', 'Section', 'Text'], // Możliwe że w przyszłości Text

	propsSchema: {
		type: 'object',
		properties: {
			...linkGroup.schema,
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...linkGroup.defaults,
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		color: '#007bff',
		textDecoration: 'underline',
		display: 'inline-block',
	},

	inspectorConfig: {
		groups: [
			linkGroup.inspectorGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...linkGroup.inspectorFields,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
