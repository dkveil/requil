import type { InspectorField } from '@requil/types';

export const fontSizeSchema = {
	fontSize: { type: 'number', minimum: 8, maximum: 72, default: 14 },
};

export const fontSizeField: InspectorField = {
	key: 'fontSize',
	label: 'Font Size',
	type: 'slider',
	min: 8,
	max: 72,
	step: 1,
};

export const fontWeightSchema = {
	fontWeight: {
		enum: ['300', '400', '500', '600', '700'],
		default: '400',
	},
};

export const fontWeightField: InspectorField = {
	key: 'fontWeight',
	label: 'Font Weight',
	type: 'select',
	options: [
		{ label: 'Light (300)', value: '300' },
		{ label: 'Normal (400)', value: '400' },
		{ label: 'Medium (500)', value: '500' },
		{ label: 'Semi-bold (600)', value: '600' },
		{ label: 'Bold (700)', value: '700' },
	],
};

export const fontFamilySchema = {
	fontFamily: { type: 'string', default: 'Arial, sans-serif' },
};

export const fontFamilyField: InspectorField = {
	key: 'fontFamily',
	label: 'Font Family',
	type: 'select',
	options: [
		{ label: 'Arial', value: 'Arial, sans-serif' },
		{ label: 'Georgia', value: 'Georgia, serif' },
		{ label: 'Times New Roman', value: '"Times New Roman", serif' },
		{ label: 'Courier', value: '"Courier New", monospace' },
		{ label: 'Verdana', value: 'Verdana, sans-serif' },
		{ label: 'Helvetica', value: 'Helvetica, sans-serif' },
	],
};

export const lineHeightSchema = {
	lineHeight: { type: 'number', minimum: 1, maximum: 3, default: 1.5 },
};

export const lineHeightField: InspectorField = {
	key: 'lineHeight',
	label: 'Line Height',
	type: 'slider',
	min: 1,
	max: 3,
	step: 0.1,
};

export const typographySchema = {
	...fontSizeSchema,
	...fontWeightSchema,
	...fontFamilySchema,
	...lineHeightSchema,
};

export const typographyFields: InspectorField[] = [
	fontSizeField,
	fontWeightField,
	fontFamilyField,
	lineHeightField,
];

export const typographyGroup = {
	id: 'typography',
	label: 'Typography',
	fields: ['fontSize', 'fontWeight', 'fontFamily', 'lineHeight'],
};
