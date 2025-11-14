import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '../../../registry/field-groups';

const listFields = [
	{
		key: 'items',
		label: 'Items',
		type: 'array' as const,
		itemTitle: 'Item',
		children: [
			{
				key: 'text',
				label: 'Text',
				type: 'textarea' as const,
				placeholder: 'List item text...',
			},
		],
	},
	{
		key: 'listType',
		label: 'List Type',
		type: 'select' as const,
		options: [
			{ label: 'Bullet List', value: 'bullet' },
			{ label: 'Numbered List', value: 'numbered' },
		],
	},
	{
		key: 'indent',
		label: 'Indent',
		type: 'slider' as const,
		min: 0,
		max: 40,
		step: 4,
		unit: 'px',
	},
];

const listContentGroup = {
	id: 'content',
	label: 'List',
	fields: ['items', 'listType', 'indent'],
};

export const ListDefinition: ComponentDefinition = {
	type: 'List',
	category: 'content',
	name: 'List',
	description: 'Bullet or numbered list',
	icon: 'List',

	allowedParents: ['Section', 'Column', 'Block'],

	propsSchema: {
		type: 'object',
		properties: {
			items: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						text: { type: 'string' },
					},
				},
				default: [
					{ id: '1', text: 'List item 1' },
					{ id: '2', text: 'List item 2' },
					{ id: '3', text: 'List item 3' },
				],
			},
			listType: {
				type: 'string',
				enum: ['bullet', 'numbered'],
				default: 'bullet',
			},
			indent: { type: 'number', default: 0 },
			...typographyGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		items: [
			{ id: '1', text: 'List item 1' },
			{ id: '2', text: 'List item 2' },
			{ id: '3', text: 'List item 3' },
		],
		listType: 'bullet',
		indent: 0,
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
	},

	inspectorConfig: {
		groups: [
			listContentGroup,
			typographyGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...listFields,
			...typographyGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-text',
};
