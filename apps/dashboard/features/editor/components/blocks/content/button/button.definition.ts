import { ComponentDefinition } from '@requil/types';
import {
	getLayoutGroup,
	stylesGroup,
	typographyGroup,
} from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';

const layoutGroup = getLayoutGroup();

export const buttonGroup = createFieldGroup({
	id: 'button',
	label: 'Button',
	fields: {
		content: {
			schema: {
				type: 'string',
				default: 'Button Text',
			},
			field: {
				key: 'content',
				label: 'Text',
				type: 'text',
				placeholder: 'Button Text',
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

export const ButtonDefinition: ComponentDefinition = {
	type: 'Button',
	category: 'content',
	name: 'Button',
	description: 'Call to action button',
	icon: 'MousePointerClick',

	allowedChildren: [],
	allowedParents: ['Root', 'Container', 'Section'],

	propsSchema: {
		type: 'object',
		properties: {
			...buttonGroup.schema,
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...buttonGroup.defaults,
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		content: 'Read more',
		fill: '#007bff',
		textColor: '#ffffff',
		padding: {
			top: 10,
			right: 20,
			bottom: 10,
			left: 20,
		},
		radius: 5,
		display: 'inline-block',
		textAlign: 'center',
	},

	inspectorConfig: {
		groups: [
			buttonGroup.inspectorGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...buttonGroup.inspectorFields,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
