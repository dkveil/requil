import type { InspectorField } from '@requil/types';

export const paddingSchema = {
	paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 0 },
	paddingBottom: { type: 'number', minimum: 0, maximum: 100, default: 0 },
	paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 0 },
	paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 0 },
};

export const paddingFields: InspectorField[] = [
	{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
	{ key: 'paddingBottom', label: 'Bottom', type: 'number', min: 0, max: 100 },
	{ key: 'paddingLeft', label: 'Left', type: 'number', min: 0, max: 100 },
	{ key: 'paddingRight', label: 'Right', type: 'number', min: 0, max: 100 },
];

export const spacingGroup = {
	id: 'spacing',
	label: 'Spacing',
	fields: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
};

export const spacingButtonSchema = {
	paddingTop: { type: 'number', minimum: 0, maximum: 50, default: 12 },
	paddingBottom: { type: 'number', minimum: 0, maximum: 50, default: 12 },
	paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 24 },
	paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 24 },
};

export const spacingButtonFields: InspectorField[] = [
	{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 50 },
	{ key: 'paddingBottom', label: 'Bottom', type: 'number', min: 0, max: 50 },
	{ key: 'paddingLeft', label: 'Left', type: 'number', min: 0, max: 100 },
	{ key: 'paddingRight', label: 'Right', type: 'number', min: 0, max: 100 },
];

export const spacingSimpleSchema = {
	paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 0 },
	paddingBottom: { type: 'number', minimum: 0, maximum: 100, default: 0 },
};

export const spacingSimpleFields: InspectorField[] = [
	{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
	{ key: 'paddingBottom', label: 'Bottom', type: 'number', min: 0, max: 100 },
];

export const spacingSimpleGroup = {
	id: 'spacing',
	label: 'Spacing',
	fields: ['paddingTop', 'paddingBottom'],
};
