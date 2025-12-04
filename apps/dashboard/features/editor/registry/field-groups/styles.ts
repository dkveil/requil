import { createFieldGroup, type FieldConfig } from './config';

export const fillFields: Record<string, FieldConfig> = {
	fill: {
		schema: {
			type: 'object',
			default: null,
		},
		field: {
			key: 'fill',
			label: 'Fill',
			type: 'group',
			isCollapsible: false,
			isAddable: true,
			emptyLabel: 'Add...',
			children: [
				{
					key: 'color',
					label: 'Color',
					type: 'color',
				},
			],
		},
	},
};

export const borderFields: Record<string, FieldConfig> = {
	border: {
		schema: {
			type: 'object',
			default: null,
		},
		field: {
			key: 'border',
			label: 'Border',
			type: 'border',
			isAddable: true,
			emptyLabel: 'Add...',
		},
	},
};

export const stylesGroup = createFieldGroup({
	id: 'styles',
	label: 'Styles',
	fields: {
		opacity: {
			schema: {
				type: 'number',
				minimum: 0,
				maximum: 1,
				default: 1,
			},
			field: {
				key: 'opacity',
				label: 'Opacity',
				type: 'slider',
				min: 0,
				max: 1,
				step: 0.01,
			},
		},
		...fillFields,
		...borderFields,
		radius: {
			schema: {
				type: 'number',
				minimum: 0,
				maximum: 50,
				default: 0,
			},
			field: {
				key: 'radius',
				label: 'Radius',
				type: 'radius',
				min: 0,
				max: 50,
			},
		},
	},
});

export const { schema: stylesSchema, defaults: stylesDefaults } = stylesGroup;
export const {
	inspectorGroup: stylesInspectorGroup,
	inspectorFields: stylesInspectorFields,
} = stylesGroup;
