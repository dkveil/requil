import { ComponentDefinition } from '@requil/types';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Text: {
		type: 'Text',
		category: 'content',
		name: 'Text',
		description: 'Basic text block',
		icon: 'Type',

		allowedParents: ['Section', 'Column'],

		propsSchema: {
			type: 'object',
			properties: {
				content: { type: 'string', default: 'Enter your text here...' },
				fontSize: { type: 'number', minimum: 8, maximum: 72, default: 14 },
				fontWeight: {
					enum: ['normal', 'bold', '300', '400', '500', '600', '700'],
					default: 'normal',
				},
				color: { type: 'string', default: '#000000' },
				textAlign: {
					enum: ['left', 'center', 'right', 'justify'],
					default: 'left',
				},
				lineHeight: { type: 'number', minimum: 1, maximum: 3, default: 1.5 },
				fontFamily: { type: 'string', default: 'Arial, sans-serif' },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				paddingBottom: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 0 },
			},
		},

		defaultProps: {
			content: 'Enter your text here...',
			fontSize: 14,
			fontWeight: 'normal',
			color: '#000000',
			textAlign: 'left',
			lineHeight: 1.5,
			fontFamily: 'Arial, sans-serif',
			paddingTop: 0,
			paddingBottom: 0,
			paddingLeft: 0,
			paddingRight: 0,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'content',
					label: 'Content',
					fields: ['content'],
				},
				{
					id: 'typography',
					label: 'Typography',
					fields: ['fontSize', 'fontWeight', 'fontFamily', 'lineHeight'],
				},
				{
					id: 'style',
					label: 'Style',
					fields: ['color', 'textAlign'],
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
			],
			fields: [
				{
					key: 'content',
					label: 'Text Content',
					type: 'textarea',
					rows: 4,
				},
				{
					key: 'fontSize',
					label: 'Font Size',
					type: 'slider',
					min: 8,
					max: 72,
					step: 1,
				},
				{
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
				},
				{
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
				},
				{
					key: 'lineHeight',
					label: 'Line Height',
					type: 'slider',
					min: 1,
					max: 3,
					step: 0.1,
				},
				{ key: 'color', label: 'Text Color', type: 'color' },
				{
					key: 'textAlign',
					label: 'Alignment',
					type: 'select',
					options: [
						{ label: 'Left', value: 'left' },
						{ label: 'Center', value: 'center' },
						{ label: 'Right', value: 'right' },
						{ label: 'Justify', value: 'justify' },
					],
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
			],
		},

		mjmlTag: 'mj-text',
	},

	Heading: {
		type: 'Heading',
		category: 'content',
		name: 'Heading',
		description: 'Heading text (H1-H6)',
		icon: 'Heading',

		allowedParents: ['Section', 'Column'],

		propsSchema: {
			type: 'object',
			properties: {
				content: { type: 'string', default: 'Your Heading' },
				level: { enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], default: 'h2' },
				fontSize: { type: 'number', minimum: 12, maximum: 72, default: 32 },
				fontWeight: { enum: ['normal', 'bold', '600', '700'], default: 'bold' },
				color: { type: 'string', default: '#000000' },
				textAlign: { enum: ['left', 'center', 'right'], default: 'left' },
				fontFamily: { type: 'string', default: 'Arial, sans-serif' },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				paddingBottom: {
					type: 'number',
					minimum: 0,
					maximum: 100,
					default: 10,
				},
			},
		},

		defaultProps: {
			content: 'Your Heading',
			level: 'h2',
			fontSize: 32,
			fontWeight: '700',
			color: '#000000',
			textAlign: 'left',
			fontFamily: 'Arial, sans-serif',
			paddingTop: 0,
			paddingBottom: 10,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'content',
					label: 'Content',
					fields: ['content', 'level'],
				},
				{
					id: 'typography',
					label: 'Typography',
					fields: ['fontSize', 'fontWeight', 'fontFamily'],
				},
				{
					id: 'style',
					label: 'Style',
					fields: ['color', 'textAlign'],
				},
				{
					id: 'spacing',
					label: 'Spacing',
					fields: ['paddingTop', 'paddingBottom'],
				},
			],
			fields: [
				{
					key: 'content',
					label: 'Heading Text',
					type: 'text',
				},
				{
					key: 'level',
					label: 'Level',
					type: 'select',
					options: [
						{ label: 'H1 (Largest)', value: 'h1' },
						{ label: 'H2', value: 'h2' },
						{ label: 'H3', value: 'h3' },
						{ label: 'H4', value: 'h4' },
						{ label: 'H5', value: 'h5' },
						{ label: 'H6 (Smallest)', value: 'h6' },
					],
				},
				{
					key: 'fontSize',
					label: 'Font Size',
					type: 'slider',
					min: 12,
					max: 72,
					step: 1,
				},
				{
					key: 'fontWeight',
					label: 'Font Weight',
					type: 'select',
					options: [
						{ label: 'Normal (400)', value: '400' },
						{ label: 'Medium (500)', value: '500' },
						{ label: 'Semi-bold (600)', value: '600' },
						{ label: 'Bold (700)', value: '700' },
					],
				},
				{
					key: 'fontFamily',
					label: 'Font Family',
					type: 'select',
					options: [
						{ label: 'Arial', value: 'Arial, sans-serif' },
						{ label: 'Georgia', value: 'Georgia, serif' },
						{ label: 'Times New Roman', value: '"Times New Roman", serif' },
						{ label: 'Verdana', value: 'Verdana, sans-serif' },
						{ label: 'Helvetica', value: 'Helvetica, sans-serif' },
					],
				},
				{ key: 'color', label: 'Text Color', type: 'color' },
				{
					key: 'textAlign',
					label: 'Alignment',
					type: 'select',
					options: [
						{ label: 'Left', value: 'left' },
						{ label: 'Center', value: 'center' },
						{ label: 'Right', value: 'right' },
					],
				},
				{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingBottom',
					label: 'Bottom',
					type: 'number',
					min: 0,
					max: 100,
				},
			],
		},

		mjmlTag: 'mj-text',
	},

	Button: {
		type: 'Button',
		category: 'content',
		name: 'Button',
		description: 'Call-to-action button',
		icon: 'RectangleHorizontal',

		allowedParents: ['Section', 'Column'],

		propsSchema: {
			type: 'object',
			properties: {
				text: { type: 'string', default: 'Click Me' },
				href: { type: 'string', default: '#' },
				backgroundColor: { type: 'string', default: '#3B82F6' },
				textColor: { type: 'string', default: '#FFFFFF' },
				fontSize: { type: 'number', minimum: 10, maximum: 32, default: 16 },
				fontWeight: { enum: ['normal', 'bold', '600'], default: '600' },
				borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 4 },
				paddingTop: { type: 'number', minimum: 0, maximum: 50, default: 12 },
				paddingBottom: { type: 'number', minimum: 0, maximum: 50, default: 12 },
				paddingLeft: { type: 'number', minimum: 0, maximum: 100, default: 24 },
				paddingRight: { type: 'number', minimum: 0, maximum: 100, default: 24 },
				align: { enum: ['left', 'center', 'right'], default: 'center' },
				fullWidth: { type: 'boolean', default: false },
			},
		},

		defaultProps: {
			text: 'Click Me',
			href: '#',
			backgroundColor: '#3B82F6',
			textColor: '#FFFFFF',
			fontSize: 16,
			fontWeight: '600',
			borderRadius: 4,
			paddingTop: 12,
			paddingBottom: 12,
			paddingLeft: 24,
			paddingRight: 24,
			align: 'center',
			fullWidth: false,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'content',
					label: 'Content',
					fields: ['text', 'href'],
				},
				{
					id: 'style',
					label: 'Style',
					fields: [
						'backgroundColor',
						'textColor',
						'fontSize',
						'fontWeight',
						'borderRadius',
					],
				},
				{
					id: 'layout',
					label: 'Layout',
					fields: ['align', 'fullWidth'],
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
			],
			fields: [
				{
					key: 'text',
					label: 'Button Text',
					type: 'text',
				},
				{
					key: 'href',
					label: 'Link URL',
					type: 'text',
					placeholder: 'https://example.com',
				},
				{ key: 'backgroundColor', label: 'Background', type: 'color' },
				{ key: 'textColor', label: 'Text Color', type: 'color' },
				{
					key: 'fontSize',
					label: 'Font Size',
					type: 'slider',
					min: 10,
					max: 32,
					step: 1,
				},
				{
					key: 'fontWeight',
					label: 'Font Weight',
					type: 'select',
					options: [
						{ label: 'Normal', value: 'normal' },
						{ label: 'Semi-bold (600)', value: '600' },
						{ label: 'Bold', value: 'bold' },
					],
				},
				{
					key: 'borderRadius',
					label: 'Border Radius',
					type: 'slider',
					min: 0,
					max: 50,
					step: 1,
				},
				{
					key: 'align',
					label: 'Alignment',
					type: 'select',
					options: [
						{ label: 'Left', value: 'left' },
						{ label: 'Center', value: 'center' },
						{ label: 'Right', value: 'right' },
					],
				},
				{ key: 'fullWidth', label: 'Full Width', type: 'toggle' },
				{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 50 },
				{
					key: 'paddingBottom',
					label: 'Bottom',
					type: 'number',
					min: 0,
					max: 50,
				},
				{ key: 'paddingLeft', label: 'Left', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingRight',
					label: 'Right',
					type: 'number',
					min: 0,
					max: 100,
				},
			],
		},

		mjmlTag: 'mj-button',
	},

	Image: {
		type: 'Image',
		category: 'content',
		name: 'Image',
		description: 'Image block',
		icon: 'Image',

		allowedParents: ['Section', 'Column'],

		propsSchema: {
			type: 'object',
			properties: {
				src: {
					type: 'string',
					default: 'https://via.placeholder.com/600x300',
				},
				alt: { type: 'string', default: 'Image description' },
				href: { type: 'string' },
				width: { type: 'string', default: '100%' },
				align: { enum: ['left', 'center', 'right'], default: 'center' },
				borderRadius: { type: 'number', minimum: 0, maximum: 50, default: 0 },
				paddingTop: { type: 'number', minimum: 0, maximum: 100, default: 0 },
				paddingBottom: { type: 'number', minimum: 0, maximum: 100, default: 0 },
			},
		},

		defaultProps: {
			src: 'https://via.placeholder.com/600x300',
			alt: 'Image description',
			width: '100%',
			align: 'center',
			borderRadius: 0,
			paddingTop: 0,
			paddingBottom: 0,
		},

		inspectorConfig: {
			groups: [
				{
					id: 'content',
					label: 'Content',
					fields: ['src', 'alt', 'href'],
				},
				{
					id: 'layout',
					label: 'Layout',
					fields: ['width', 'align'],
				},
				{
					id: 'style',
					label: 'Style',
					fields: ['borderRadius'],
				},
				{
					id: 'spacing',
					label: 'Spacing',
					fields: ['paddingTop', 'paddingBottom'],
				},
			],
			fields: [
				{
					key: 'src',
					label: 'Image URL',
					type: 'image',
					placeholder: 'https://example.com/image.jpg',
				},
				{
					key: 'alt',
					label: 'Alt Text',
					type: 'text',
					placeholder: 'Description for accessibility',
				},
				{
					key: 'href',
					label: 'Link URL (optional)',
					type: 'text',
					placeholder: 'https://example.com',
				},
				{
					key: 'width',
					label: 'Width',
					type: 'text',
					placeholder: '100%, 300px',
				},
				{
					key: 'align',
					label: 'Alignment',
					type: 'select',
					options: [
						{ label: 'Left', value: 'left' },
						{ label: 'Center', value: 'center' },
						{ label: 'Right', value: 'right' },
					],
				},
				{
					key: 'borderRadius',
					label: 'Border Radius',
					type: 'slider',
					min: 0,
					max: 50,
					step: 1,
				},
				{ key: 'paddingTop', label: 'Top', type: 'number', min: 0, max: 100 },
				{
					key: 'paddingBottom',
					label: 'Bottom',
					type: 'number',
					min: 0,
					max: 100,
				},
			],
		},

		mjmlTag: 'mj-image',
	},
};
