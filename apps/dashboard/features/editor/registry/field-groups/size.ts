import { createFieldGroup } from './config';

export const sizeGroup = createFieldGroup({
	id: 'size',
	label: 'Size',
	fields: {
		width: {
			schema: {
				type: 'string',
				default: '100%',
			},
			field: {
				key: 'width',
				label: 'Width',
				type: 'size',
				placeholder: '100',
				options: [
					{ label: '%', value: '%' },
					{ label: 'px', value: 'px' },
					{ label: 'Auto', value: 'auto' },
				],
			},
		},
		minHeight: {
			schema: {
				type: 'string',
				default: 'auto',
			},
			field: {
				key: 'minHeight',
				label: 'Min Height',
				type: 'size',
				placeholder: 'auto',
				options: [
					{ label: 'Auto', value: 'auto' },
					{ label: 'px', value: 'px' },
					{ label: '%', value: '%' },
				],
			},
		},
		maxWidth: {
			schema: {
				type: 'string',
				default: null,
			},
			field: {
				key: 'maxWidth',
				label: 'Max Width',
				type: 'size',
				placeholder: '600',
				options: [
					{ label: 'px', value: 'px' },
					{ label: '%', value: '%' },
				],
			},
		},
	},
});

export const { schema: sizeSchema, defaults: sizeDefaults } = sizeGroup;
export const {
	inspectorGroup: sizeInspectorGroup,
	inspectorFields: sizeInspectorFields,
} = sizeGroup;
