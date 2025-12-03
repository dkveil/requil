import { createFieldGroup, FieldConfig } from './config';

export const paddingFields: Record<string, FieldConfig> = {
	padding: {
		schema: {
			type: 'number',
			minimum: 0,
			default: 0,
		},
		field: {
			key: 'padding',
			label: 'Padding',
			type: 'padding',
			defaultExpanded: true,
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
	},
});

export const { schema: layoutSchema, defaults: layoutDefaults } = layoutGroup;
export const {
	inspectorGroup: layoutInspectorGroup,
	inspectorFields: layoutInspectorFields,
} = layoutGroup;
