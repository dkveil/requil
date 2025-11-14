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
			{ label: 'Custom Markers', value: 'custom' },
		],
	},
	{
		key: 'showMarkers',
		label: 'Show Markers',
		type: 'toggle' as const,
		condition: {
			field: 'listType',
			operator: 'notEq' as const,
			value: 'custom',
		},
	},
	{
		key: 'markerColor',
		label: 'Marker Color',
		type: 'color' as const,
		condition: {
			field: 'showMarkers',
			operator: 'truthy' as const,
			value: true,
		},
	},
	{
		key: 'customMarker',
		label: 'Custom Marker',
		type: 'text' as const,
		placeholder: '→',
		condition: {
			field: 'listType',
			operator: 'eq' as const,
			value: 'custom',
		},
	},
	{
		key: 'customMarkerColor',
		label: 'Marker Color',
		type: 'color' as const,
		condition: {
			field: 'listType',
			operator: 'eq' as const,
			value: 'custom',
		},
	},
];

const listContentGroup = {
	id: 'content',
	label: 'List',
	fields: [
		'items',
		'listType',
		'showMarkers',
		'markerColor',
		'customMarker',
		'customMarkerColor',
	],
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
				enum: ['bullet', 'numbered', 'custom'],
				default: 'bullet',
			},
			showMarkers: { type: 'boolean', default: true },
			markerColor: { type: 'string', default: 'inherit' },
			customMarker: { type: 'string', default: '→' },
			customMarkerColor: { type: 'string', default: '#000000' },
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
		showMarkers: true,
		markerColor: 'inherit',
		customMarker: '→',
		customMarkerColor: '#000000',
		...typographyGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		gap: 0,
		padding: {
			top: 12,
			right: 0,
			bottom: 12,
			left: 0,
		},
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
