import { createFieldGroup } from './config';

export const typographyGroup = createFieldGroup({
	id: 'typography',
	label: 'Typography',
	fields: {
		fontSize: {
			schema: {
				type: 'number',
				minimum: 8,
				maximum: 72,
				default: 16,
			},
			field: {
				key: 'fontSize',
				label: 'Font Size',
				type: 'slider',
				min: 8,
				max: 72,
				step: 1,
			},
		},
		fontWeight: {
			schema: {
				type: 'string',
				enum: ['300', '400', '500', '600', '700', '800'],
				default: '400',
			},
			field: {
				key: 'fontWeight',
				label: 'Font Weight',
				type: 'select',
				options: [
					{ label: 'Light (300)', value: '300' },
					{ label: 'Normal (400)', value: '400' },
					{ label: 'Medium (500)', value: '500' },
					{ label: 'Semi-bold (600)', value: '600' },
					{ label: 'Bold (700)', value: '700' },
					{ label: 'Extra Bold (800)', value: '800' },
				],
			},
		},
		textAlign: {
			schema: {
				type: 'string',
				enum: ['left', 'center', 'right', 'justify'],
				default: 'left',
			},
			field: {
				key: 'textAlign',
				label: 'Text Align',
				type: 'iconSelect',
				options: [
					{ label: 'Left', value: 'left', icon: 'AlignLeft' },
					{ label: 'Center', value: 'center', icon: 'AlignCenter' },
					{ label: 'Right', value: 'right', icon: 'AlignRight' },
					{ label: 'Justify', value: 'justify', icon: 'AlignJustify' },
				],
			},
		},
		lineHeight: {
			schema: {
				type: 'number',
				minimum: 1,
				maximum: 3,
				default: 1.5,
			},
			field: {
				key: 'lineHeight',
				label: 'Line Height',
				type: 'slider',
				min: 1,
				max: 3,
				step: 0.1,
			},
		},
		letterSpacing: {
			schema: {
				type: 'number',
				minimum: -2,
				maximum: 10,
				default: 0,
			},
			field: {
				key: 'letterSpacing',
				label: 'Letter Spacing',
				type: 'slider',
				min: -2,
				max: 10,
				step: 0.1,
			},
		},
		fontFamily: {
			schema: {
				type: 'string',
				enum: [
					'Arial, sans-serif',
					'Georgia, serif',
					'"Times New Roman", serif',
					'Verdana, sans-serif',
					'Helvetica, sans-serif',
					'"Courier New", monospace',
				],
				default: 'Arial, sans-serif',
			},
			field: {
				key: 'fontFamily',
				label: 'Font Family',
				type: 'select',
				options: [
					{ label: 'Arial', value: 'Arial, sans-serif' },
					{ label: 'Georgia', value: 'Georgia, serif' },
					{ label: 'Times New Roman', value: '"Times New Roman", serif' },
					{ label: 'Verdana', value: 'Verdana, sans-serif' },
					{ label: 'Helvetica', value: 'Helvetica, sans-serif' },
					{ label: 'Courier New', value: '"Courier New", monospace' },
				],
			},
		},
		textColor: {
			schema: {
				type: 'string',
				default: '#000000',
			},
			field: {
				key: 'textColor',
				label: 'Text Color',
				type: 'color',
			},
		},
	},
});

export const { schema: typographySchema, defaults: typographyDefaults } =
	typographyGroup;
export const {
	inspectorGroup: typographyInspectorGroup,
	inspectorFields: typographyInspectorFields,
} = typographyGroup;
