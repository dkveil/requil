import type { ComponentDefinition } from '@requil/types/editor';

export const LAYOUT_COMPONENTS: Record<string, ComponentDefinition> = {
	Container: {
		type: 'Container',
		category: 'layout',
		name: 'Container',
		description: 'Main content wrapper with max-width constraint',
		icon: 'Container',

		allowedChildren: ['Section', 'Columns', 'Spacer', 'Divider'],
		minChildren: 0,

		propsSchema: {
			type: 'object',
			properties: {
				maxWidth: { type: 'number', minimum: 320, maximum: 800, default: 600 },
				fullWidth: { type: 'boolean', default: false },
				backgroundColor: { type: 'string', default: '#FFFFFF' },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 20 },
				paddingBottom: {
					type: 'number',
					minimum: 0,
					maximum: 100,
					default: 20,
				},
				paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 10 },
				paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 10 },
			},
		},

		defaultProps: {
			maxWidth: 600,
			fullWidth: false,
			backgroundColor: '#FFFFFF',
			paddingTop: 20,
			paddingBottom: 20,
			paddingLeft: 10,
			paddingRight: 10,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'layout',
					label: 'Layout',
					fields: ['maxWidth', 'fullWidth'],
				},
				{
					id: 'spacing',
					label: 'Spacing',
					fields: [
						'paddingTop',
						'paddingBottom',
						'paddingLeft',
						'paddingRight',
					],
				},
				{
					id: 'style',
					label: 'Style',
					fields: ['backgroundColor'],
				},
			],
			fields: [
				{
					key: 'maxWidth',
					label: 'Max Width',
					type: 'slider',
					min: 320,
					max: 800,
					step: 10,
				},
				{ key: 'fullWidth', label: 'Full Width', type: 'toggle' },
				{ key: 'backgroundColor', label: 'Background Color', type: 'color' },
				{
					key: 'paddingTop',
					label: 'Top',
					type: 'number',
					min: 0,
					max: 100,
					group: 'spacing',
				},
				{
					key: 'paddingBottom',
					label: 'Bottom',
					type: 'number',
					min: 0,
					max: 100,
					group: 'spacing',
				},
				{
					key: 'paddingLeft',
					label: 'Left',
					type: 'number',
					min: 0,
					max: 100,
					group: 'spacing',
				},
				{
					key: 'paddingRight',
					label: 'Right',
					type: 'number',
					min: 0,
					max: 100,
					group: 'spacing',
				},
			],
		},

		mjmlTag: 'mj-wrapper',
	},

	Section: {
		type: 'Section',
		category: 'layout',
		name: 'Section',
		description: 'Full-width section for content grouping',
		icon: 'Box',

		allowedChildren: [
			'Columns',
			'Text',
			'Heading',
			'Button',
			'Image',
			'Spacer',
			'Divider',
		],
		allowedParents: ['Container'],

		propsSchema: {
			type: 'object',
			properties: {
				fullWidth: { type: 'boolean', default: true },
				backgroundColor: { type: 'string', default: '#FFFFFF' },
				backgroundImage: { type: 'string' },
				backgroundSize: {
					enum: ['cover', 'contain', 'auto'],
					default: 'cover',
				},
				backgroundPosition: { type: 'string', default: 'center center' },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 20 },
				paddingBottom: {
					type: 'number',
					minimum: 0,
					maximum: 100,
					default: 20,
				},
				paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				borderWidth: { type: 'number', minimum: 0, maximum: 20, default: 0 },
				borderColor: { type: 'string', default: '#DDDDDD' },
				borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 0 },
			},
		},

		defaultProps: {
			fullWidth: true,
			backgroundColor: '#FFFFFF',
			paddingTop: 20,
			paddingBottom: 20,
			paddingLeft: 0,
			paddingRight: 0,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'background',
					label: 'Background',
					fields: [
						'backgroundColor',
						'backgroundImage',
						'backgroundSize',
						'backgroundPosition',
					],
				},
				{
					id: 'spacing',
					label: 'Spacing',
					fields: [
						'paddingTop',
						'paddingBottom',
						'paddingLeft',
						'paddingRight',
					],
				},
				{
					id: 'borders',
					label: 'Borders',
					fields: ['borderWidth', 'borderColor', 'borderRadius'],
				},
			],
			fields: [
				{ key: 'backgroundColor', label: 'Background Color', type: 'color' },
				{ key: 'backgroundImage', label: 'Background Image', type: 'image' },
				{
					key: 'backgroundSize',
					label: 'Size',
					type: 'select',
					options: [
						{ label: 'Cover', value: 'cover' },
						{ label: 'Contain', value: 'contain' },
						{ label: 'Auto', value: 'auto' },
					],
				},
				{
					key: 'backgroundPosition',
					label: 'Position',
					type: 'text',
					placeholder: 'center center',
				},
				{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingBottom',
					label: 'Bottom',
					type: 'number',
					min: 0,
					max: 100,
				},
				{ key: 'paddingLeft', label: 'Left', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingRight',
					label: 'Right',
					type: 'number',
					min: 0,
					max: 100,
				},
				{ key: 'borderWidth', label: 'Width', type: 'number', min: 0, max: 20 },
				{ key: 'borderColor', label: 'Color', type: 'color' },
				{
					key: 'borderRadius',
					label: 'Radius',
					type: 'slider',
					min: 0,
					max: 50,
				},
			],
		},

		mjmlTag: 'mj-section',
	},

	Columns: {
		type: 'Columns',
		category: 'layout',
		name: 'Columns',
		description: 'Multi-column layout container',
		icon: 'Columns2',

		allowedChildren: ['Column'],
		allowedParents: ['Container', 'Section'],
		minChildren: 1,
		maxChildren: 4,

		propsSchema: {
			type: 'object',
			properties: {
				columnCount: { type: 'number', minimum: 1, maximum: 4, default: 2 },
				gap: { type: 'number', minimum: 0, maximum: 50, default: 0 },
				stackOnMobile: { type: 'boolean', default: true },
				verticalAlign: { enum: ['top', 'middle', 'bottom'], default: 'top' },
			},
		},

		defaultProps: {
			columnCount: 2,
			gap: 0,
			stackOnMobile: true,
			verticalAlign: 'top',
		},

		inspectorConfig: {
			fields: [
				{
					key: 'columnCount',
					label: 'Columns',
					type: 'select',
					options: [
						{ label: '1 Column', value: 1 },
						{ label: '2 Columns', value: 2 },
						{ label: '3 Columns', value: 3 },
						{ label: '4 Columns', value: 4 },
					],
				},
				{ key: 'gap', label: 'Gap', type: 'slider', min: 0, max: 50 },
				{ key: 'stackOnMobile', label: 'Stack on Mobile', type: 'toggle' },
				{
					key: 'verticalAlign',
					label: 'Vertical Align',
					type: 'select',
					options: [
						{ label: 'Top', value: 'top' },
						{ label: 'Middle', value: 'middle' },
						{ label: 'Bottom', value: 'bottom' },
					],
				},
			],
		},

		mjmlTag: 'mj-group',
	},

	Column: {
		type: 'Column',
		category: 'layout',
		name: 'Column',
		description: 'Single column within Columns',
		icon: 'Box',
		isHidden: true, // Don't show in palette - created automatically

		allowedChildren: [
			'Text',
			'Heading',
			'Button',
			'Image',
			'Spacer',
			'Divider',
		],
		allowedParents: ['Columns'],

		propsSchema: {
			type: 'object',
			properties: {
				width: { type: 'string', default: 'auto' }, // "50%", "200px", "auto"
				backgroundColor: { type: 'string' },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 10 },
				paddingBottom: {
					type: 'number',
					minimum: 0,
					maximum: 100,
					default: 10,
				},
				paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 10 },
				paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 10 },
				borderWidth: { type: 'number', minimum: 0, maximum: 20, default: 0 },
				borderColor: { type: 'string', default: '#DDDDDD' },
				borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 0 },
			},
		},

		defaultProps: {
			width: 'auto',
			paddingTop: 10,
			paddingBottom: 10,
			paddingLeft: 10,
			paddingRight: 10,
		},

		inspectorConfig: {
			groups: [
				{ id: 'layout', label: 'Layout', fields: ['width'] },
				{
					id: 'spacing',
					label: 'Spacing',
					fields: [
						'paddingTop',
						'paddingBottom',
						'paddingLeft',
						'paddingRight',
					],
				},
				{
					id: 'style',
					label: 'Style',
					fields: [
						'backgroundColor',
						'borderWidth',
						'borderColor',
						'borderRadius',
					],
				},
			],
			fields: [
				{
					key: 'width',
					label: 'Width',
					type: 'text',
					placeholder: 'auto, 50%, 200px',
				},
				{ key: 'backgroundColor', label: 'Background', type: 'color' },
				{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingBottom',
					label: 'Bottom',
					type: 'number',
					min: 0,
					max: 100,
				},
				{ key: 'paddingLeft', label: 'Left', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingRight',
					label: 'Right',
					type: 'number',
					min: 0,
					max: 100,
				},
				{
					key: 'borderWidth',
					label: 'Border',
					type: 'number',
					min: 0,
					max: 20,
				},
				{ key: 'borderColor', label: 'Color', type: 'color' },
				{
					key: 'borderRadius',
					label: 'Radius',
					type: 'slider',
					min: 0,
					max: 50,
				},
			],
		},

		mjmlTag: 'mj-column',
	},

	Spacer: {
		type: 'Spacer',
		category: 'layout',
		name: 'Spacer',
		description: 'Vertical spacing between elements',
		icon: 'Space',
		isVoid: true,

		allowedParents: ['Container', 'Section', 'Column'],

		propsSchema: {
			type: 'object',
			properties: {
				height: { type: 'number', minimum: 0, maximum: 200, default: 20 },
			},
		},

		defaultProps: {
			height: 20,
		},

		inspectorConfig: {
			fields: [
				{
					key: 'height',
					label: 'Height (px)',
					type: 'slider',
					min: 0,
					max: 200,
					step: 5,
				},
			],
		},

		mjmlTag: 'mj-spacer',
	},

	Divider: {
		type: 'Divider',
		category: 'layout',
		name: 'Divider',
		description: 'Horizontal line separator',
		icon: 'Minus',
		isVoid: true,

		allowedParents: ['Container', 'Section', 'Column'],

		propsSchema: {
			type: 'object',
			properties: {
				thickness: { type: 'number', minimum: 1, maximum: 10, default: 1 },
				color: { type: 'string', default: '#DDDDDD' },
				style: { enum: ['solid', 'dashed', 'dotted'], default: 'solid' },
				width: { type: 'string', default: '100%' },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 10 },
				paddingBottom: {
					type: 'number',
					minimum: 0,
					maximum: 100,
					default: 10,
				},
			},
		},

		defaultProps: {
			thickness: 1,
			color: '#DDDDDD',
			style: 'solid',
			width: '100%',
			paddingTop: 10,
			paddingBottom: 10,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'style',
					label: 'Style',
					fields: ['thickness', 'color', 'style', 'width'],
				},
				{
					id: 'spacing',
					label: 'Spacing',
					fields: ['paddingTop', 'paddingBottom'],
				},
			],
			fields: [
				{
					key: 'thickness',
					label: 'Thickness (px)',
					type: 'slider',
					min: 1,
					max: 10,
				},
				{ key: 'color', label: 'Color', type: 'color' },
				{
					key: 'style',
					label: 'Style',
					type: 'select',
					options: [
						{ label: 'Solid', value: 'solid' },
						{ label: 'Dashed', value: 'dashed' },
						{ label: 'Dotted', value: 'dotted' },
					],
				},
				{
					key: 'width',
					label: 'Width',
					type: 'text',
					placeholder: '100%, 50%, 300px',
				},
				{
					key: 'paddingTop',
					label: 'Top Padding',
					type: 'number',
					min: 0,
					max: 100,
				},
				{
					key: 'paddingBottom',
					label: 'Bottom Padding',
					type: 'number',
					min: 0,
					max: 100,
				},
			],
		},

		mjmlTag: 'mj-divider',
	},
};
