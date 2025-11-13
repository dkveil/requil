import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	sizeGroup,
	stylesGroup,
	typographyGroup,
} from '../../../registry/field-groups';

const buttonFields = [
	{
		key: 'text',
		label: 'Text',
		type: 'text' as const,
		placeholder: 'Click Me',
	},
	{
		key: 'action',
		label: 'Action',
		type: 'select' as const,
		options: [{ label: 'Link', value: 'link' }],
	},
	{
		key: 'href',
		label: 'Link URL',
		type: 'text' as const,
		placeholder: '#',
		condition: {
			field: 'action',
			operator: 'eq' as const,
			value: 'link',
		},
	},
];

const buttonContentGroup = {
	id: 'content',
	label: 'Button',
	fields: ['text', 'href', 'action'],
};

export const ButtonDefinition: ComponentDefinition = {
	type: 'Button',
	category: 'content',
	name: 'Button',
	description: 'Call-to-action button',
	icon: 'RectangleHorizontal',

	allowedParents: ['Section', 'Column', 'Block'],

	propsSchema: {
		type: 'object',
		properties: {
			text: { type: 'string', default: 'Click Me' },
			action: { type: 'string', default: 'link' },
			href: { type: 'string', default: '#' },
			fullWidth: { type: 'boolean', default: false },
			...sizeGroup.schema,
			...layoutGroup.schema,
			...typographyGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		text: 'Click Me',
		action: 'link',
		href: '#',
		...sizeGroup.defaults,
		...layoutGroup.defaults,
		...typographyGroup.defaults,
		...stylesGroup.defaults,
		width: 'auto',
		fill: {
			color: '#3B82F6',
		},
		align: 'center',
		textAlign: 'center',
		fontSize: 16,
		fontWeight: '600',
		padding: 12,
		borderRadius: 4,
	},

	inspectorConfig: {
		groups: [
			buttonContentGroup,
			sizeGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			typographyGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...buttonFields,
			...sizeGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...typographyGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-button',
};
