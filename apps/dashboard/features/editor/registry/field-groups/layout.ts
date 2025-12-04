import { createFieldGroup, FieldConfig } from './config';

export const paddingFields: Record<string, FieldConfig> = {
	padding: {
		schema: {
			oneOf: [
				{ type: 'number', minimum: 0 },
				{
					type: 'object',
					properties: {
						top: { oneOf: [{ type: 'number' }] },
						right: { oneOf: [{ type: 'number' }] },
						bottom: { oneOf: [{ type: 'number' }] },
						left: { oneOf: [{ type: 'number' }] },
					},
				},
			],
			default: 0,
		},
		field: {
			key: 'padding',
			label: 'Padding',
			type: 'padding',
			defaultExpanded: false,
		},
	},
};

export const marginFields: Record<string, FieldConfig> = {
	margin: {
		schema: {
			oneOf: [
				{ type: 'number', minimum: 0 },
				{ type: 'string', enum: ['auto'] },
				{
					type: 'object',
					properties: {
						top: {
							oneOf: [{ type: 'number' }, { type: 'string', enum: ['auto'] }],
						},
						right: {
							oneOf: [{ type: 'number' }, { type: 'string', enum: ['auto'] }],
						},
						bottom: {
							oneOf: [{ type: 'number' }, { type: 'string', enum: ['auto'] }],
						},
						left: {
							oneOf: [{ type: 'number' }, { type: 'string', enum: ['auto'] }],
						},
					},
				},
			],
			default: 0,
		},
		field: {
			key: 'margin',
			label: 'Margin',
			type: 'margin',
			defaultExpanded: false,
		},
	},
};

export const layoutGroup = createFieldGroup({
	id: 'layout',
	label: 'Layout',
	fields: {
		align: {
			schema: {
				type: 'string',
				enum: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
				default: 'flex-start',
			},
			field: {
				key: 'align',
				label: 'Align',
				type: 'iconSelect',
				options: [
					{ label: 'Start', value: 'flex-start', icon: 'AlignStartHorizontal' },
					{ label: 'Center', value: 'center', icon: 'AlignCenterHorizontal' },
					{ label: 'End', value: 'flex-end', icon: 'AlignEndHorizontal' },
					{
						label: 'Stretch',
						value: 'stretch',
						icon: 'AlignVerticalSpaceAround',
					},
					{ label: 'Baseline', value: 'baseline', icon: 'Baseline' },
				],
			},
		},
		gap: {
			schema: {
				type: 'number',
				minimum: 0,
				maximum: 100,
				default: 0,
			},
			field: {
				key: 'gap',
				label: 'Gap',
				type: 'slider',
				min: 0,
				max: 100,
				step: 1,
			},
		},
		...paddingFields,
		...marginFields,
	},
});

export const { schema: layoutSchema, defaults: layoutDefaults } = layoutGroup;
export const {
	inspectorGroup: layoutInspectorGroup,
	inspectorFields: layoutInspectorFields,
} = layoutGroup;
