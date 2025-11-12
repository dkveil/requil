import { ComponentDefinition } from '@requil/types';
import {
	backgroundColorField,
	backgroundColorSchema,
	colorField,
	colorSchema,
	textColorField,
	textColorSchema,
} from './fields/colors';
import {
	buttonContentGroup,
	buttonFields,
	buttonSchema,
	contentField,
	contentGroup,
	contentSchema,
	headingContentFields,
	headingContentGroup,
	headingContentSchema,
	imageContentGroup,
	imageFields,
	imageSchema,
} from './fields/content';
import {
	alignField,
	alignSchema,
	borderRadiusButtonSchema,
	borderRadiusField,
	borderRadiusSchema,
	fullWidthField,
	fullWidthSchema,
	imageLayoutGroup,
	layoutGroup,
	styleGroup,
	textAlignField,
	textAlignSchema,
	widthField,
	widthSchema,
} from './fields/layout';
import {
	paddingFields,
	paddingSchema,
	spacingButtonFields,
	spacingButtonSchema,
	spacingGroup,
	spacingSimpleFields,
	spacingSimpleGroup,
	spacingSimpleSchema,
} from './fields/spacing';
import {
	fontWeightField,
	fontWeightSchema,
	typographyFields,
	typographyGroup,
	typographySchema,
} from './fields/typography';

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
				...contentSchema,
				...typographySchema,
				...colorSchema,
				...textAlignSchema,
				...paddingSchema,
			},
		},

		defaultProps: {
			content: 'Enter your text here...',
			fontSize: 14,
			fontWeight: '400',
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
			groups: [contentGroup, typographyGroup, styleGroup, spacingGroup],
			fields: [
				contentField,
				...typographyFields,
				colorField,
				textAlignField,
				...paddingFields,
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
				...headingContentSchema,
				fontSize: { type: 'number', minimum: 12, maximum: 72, default: 32 },
				...fontWeightSchema,
				...colorSchema,
				...textAlignSchema,
				...spacingSimpleSchema,
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
				headingContentGroup,
				typographyGroup,
				styleGroup,
				spacingSimpleGroup,
			],
			fields: [
				...headingContentFields,
				{
					key: 'fontSize',
					label: 'Font Size',
					type: 'slider',
					min: 12,
					max: 72,
					step: 1,
				},
				fontWeightField,
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
				colorField,
				textAlignField,
				...spacingSimpleFields,
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
				...buttonSchema,
				...backgroundColorSchema,
				...textColorSchema,
				fontSize: { type: 'number', minimum: 10, maximum: 32, default: 16 },
				...fontWeightSchema,
				...borderRadiusButtonSchema,
				...spacingButtonSchema,
				...alignSchema,
				...fullWidthSchema,
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
				buttonContentGroup,
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
				layoutGroup,
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
				...buttonFields,
				backgroundColorField,
				textColorField,
				{
					key: 'fontSize',
					label: 'Font Size',
					type: 'slider',
					min: 10,
					max: 32,
					step: 1,
				},
				fontWeightField,
				borderRadiusField,
				alignField,
				fullWidthField,
				...spacingButtonFields,
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
				...imageSchema,
				...widthSchema,
				...alignSchema,
				...borderRadiusSchema,
				...spacingSimpleSchema,
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
				imageContentGroup,
				imageLayoutGroup,
				{
					id: 'style',
					label: 'Style',
					fields: ['borderRadius'],
				},
				spacingSimpleGroup,
			],
			fields: [
				...imageFields,
				widthField,
				alignField,
				borderRadiusField,
				...spacingSimpleFields,
			],
		},

		mjmlTag: 'mj-image',
	},
};
