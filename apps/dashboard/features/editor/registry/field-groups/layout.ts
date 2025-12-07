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

export const getLayoutGroup = (
	options: {
		verticalAlign?: boolean;
		horizontalAlign?: boolean;
		gap?: boolean;
	} = {}
) => {
	const fields: Record<string, FieldConfig> = {
		...paddingFields,
		...marginFields,
	};

	if (options.gap) {
		fields.gap = {
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
		};
	}

	if (options.verticalAlign) {
		fields.verticalAlign = {
			schema: {
				type: 'string',
				enum: ['top', 'middle', 'bottom'],
				default: 'top',
			},
			field: {
				key: 'verticalAlign',
				label: 'Vertical Align',
				type: 'iconSelect',
				options: [
					{ label: 'Top', value: 'top', icon: 'AlignStartVertical' },
					{
						label: 'Middle',
						value: 'middle',
						icon: 'AlignCenterVertical',
					},
					{ label: 'Bottom', value: 'bottom', icon: 'AlignEndVertical' },
				],
			},
		};
	}

	if (options.horizontalAlign) {
		fields.align = {
			schema: {
				type: 'string',
				enum: ['left', 'center', 'right'],
				default: 'center',
			},
			field: {
				key: 'align',
				label: 'Horizontal Align',
				type: 'iconSelect',
				options: [
					{ label: 'Left', value: 'left', icon: 'AlignLeft' },
					{ label: 'Center', value: 'center', icon: 'AlignCenter' },
					{ label: 'Right', value: 'right', icon: 'AlignRight' },
				],
			},
		};
	}

	return createFieldGroup({
		id: 'layout',
		label: 'Layout',
		fields,
	});
};
