import type { InspectorField } from '@requil/types';

export const alignSchema = {
	align: { enum: ['left', 'center', 'right'], default: 'center' },
};

export const alignField: InspectorField = {
	key: 'align',
	label: 'Alignment',
	type: 'select',
	options: [
		{ label: 'Left', value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right', value: 'right' },
	],
};

export const textAlignSchema = {
	textAlign: {
		enum: ['left', 'center', 'right', 'justify'],
		default: 'left',
	},
};

export const textAlignField: InspectorField = {
	key: 'textAlign',
	label: 'Alignment',
	type: 'select',
	options: [
		{ label: 'Left', value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right', value: 'right' },
		{ label: 'Justify', value: 'justify' },
	],
};

export const fullWidthSchema = {
	fullWidth: { type: 'boolean', default: false },
};

export const fullWidthField: InspectorField = {
	key: 'fullWidth',
	label: 'Full Width',
	type: 'toggle',
};

export const widthSchema = {
	width: { type: 'string', default: '100%' },
};

export const widthField: InspectorField = {
	key: 'width',
	label: 'Width',
	type: 'text',
	placeholder: '100%, 300px',
};

export const borderRadiusSchema = {
	borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 0 },
};

export const borderRadiusField: InspectorField = {
	key: 'borderRadius',
	label: 'Border Radius',
	type: 'slider',
	min: 0,
	max: 50,
	step: 1,
};

export const borderRadiusButtonSchema = {
	borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 4 },
};

export const layoutGroup = {
	id: 'layout',
	label: 'Layout',
	fields: ['align', 'fullWidth'],
};

export const styleGroup = {
	id: 'style',
	label: 'Style',
	fields: ['color', 'textAlign'],
};

export const imageLayoutGroup = {
	id: 'layout',
	label: 'Layout',
	fields: ['width', 'align'],
};
