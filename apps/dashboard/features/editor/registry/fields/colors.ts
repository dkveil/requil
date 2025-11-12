import type { InspectorField } from '@requil/types';

export const colorSchema = {
	color: { type: 'string', default: '#000000' },
};

export const colorField: InspectorField = {
	key: 'color',
	label: 'Text Color',
	type: 'color',
};

export const backgroundColorSchema = {
	backgroundColor: { type: 'string', default: '#3B82F6' },
};

export const backgroundColorField: InspectorField = {
	key: 'backgroundColor',
	label: 'Background',
	type: 'color',
};

export const textColorSchema = {
	textColor: { type: 'string', default: '#FFFFFF' },
};

export const textColorField: InspectorField = {
	key: 'textColor',
	label: 'Text Color',
	type: 'color',
};
