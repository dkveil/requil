import { ComponentDefinition } from '@requil/types';
import { stylesGroup, typographyGroup } from '../../../registry/field-groups';

const buttonFields = [
	{
		key: 'text',
		label: 'Text',
		type: 'text' as const,
		placeholder: 'Click Me',
	},
	{
		key: 'href',
		label: 'Link URL',
		type: 'text' as const,
		placeholder: '#',
	},
];

const buttonContentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['text', 'href'],
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
			href: { type: 'string', default: '#' },
			backgroundColor: { type: 'string', default: '#3B82F6' },
			...typographyGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		text: 'Click Me',
		href: '#',
		backgroundColor: '#3B82F6',
		...typographyGroup.defaults,
		...stylesGroup.defaults,
		fontSize: 16,
		fontWeight: '600',
		padding: 12,
	},

	inspectorConfig: {
		groups: [
			buttonContentGroup,
			typographyGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...buttonFields,
			{
				key: 'backgroundColor',
				label: 'Background Color',
				type: 'color' as const,
			},
			...typographyGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-button',
};
