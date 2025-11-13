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
		border: {
			schema: {
				type: 'object',
				default: null,
			},
			field: {
				key: 'border',
				label: 'Border',
				type: 'group',
				isCollapsible: false,
				isAddable: true,
				emptyLabel: 'Add...',
				children: [
					{
						key: 'width',
						label: 'Width',
						type: 'slider',
						min: 0,
						max: 20,
						step: 1,
					},
					{
						key: 'color',
						label: 'Color',
						type: 'color',
					},
					{
						key: 'style',
						label: 'Style',
						type: 'select',
						options: [
							{ label: 'Solid', value: 'solid' },
							{ label: 'Dashed', value: 'dashed' },
							{ label: 'Dotted', value: 'dotted' },
							{ label: 'Double', value: 'double' },
						],
					},
				],
			},
		},
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
		// TODO: not supported yet
		// backgroundImage: {
		// 	schema: {
		// 		type: 'object',
		// 		default: {
		// 			image: '',
		// 			size: 'cover',
		// 			position: 'center',
		// 		}
		// 	},
		// 	field: {
		// 		key: 'backgroundImage',
		// 		label: 'Background Image',
		// 		type: 'group',
		// 		isCollapsible: true,
		// 		isExpanded: false,
		// 		children: [
		// 			{
		// 				key: 'image',
		// 				label: 'Image URL',
		// 				type: 'image',
		// 				placeholder: 'https://example.com/image.jpg',
		// 			},
		// 			{
		// 				key: 'size',
		// 				label: 'Size',
		// 				type: 'select',
		// 				options: [
		// 					{ label: 'Cover', value: 'cover' },
		// 					{ label: 'Contain', value: 'contain' },
		// 					{ label: 'Auto', value: 'auto' },
		// 				],
		// 			},
		// 			{
		// 				key: 'position',
		// 				label: 'Position',
		// 				type: 'select',
		// 				options: [
		// 					{ label: 'Left Top', value: 'left top' },
		// 					{ label: 'Left Center', value: 'left center' },
		// 					{ label: 'Left Bottom', value: 'left bottom' },
		// 					{ label: 'Center Top', value: 'center top' },
		// 					{ label: 'Center', value: 'center' },
		// 					{ label: 'Center Bottom', value: 'center bottom' },
		// 					{ label: 'Right Top', value: 'right top' },
		// 					{ label: 'Right Center', value: 'right center' },
		// 					{ label: 'Right Bottom', value: 'right bottom' },
		// 					{ label: 'Top', value: 'top' },
		// 					{ label: 'Bottom', value: 'bottom' },
		// 					{ label: 'Left', value: 'left' },
		// 					{ label: 'Right', value: 'right' },
		// 					{ label: 'Custom', value: 'custom' },
		// 				],
		// 			},
		// 		],
		// 	},
		// },
	},
});

export const { schema: stylesSchema, defaults: stylesDefaults } = stylesGroup;
export const {
	inspectorGroup: stylesInspectorGroup,
	inspectorFields: stylesInspectorFields,
} = stylesGroup;
