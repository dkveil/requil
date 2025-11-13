import { ComponentDefinition } from '@requil/types';
import { colorField, colorSchema } from '../../../registry/fields/colors';
import {
	headingContentFields,
	headingContentGroup,
	headingContentSchema,
} from '../../../registry/fields/content';
import {
	styleGroup,
	textAlignField,
	textAlignSchema,
} from '../../../registry/fields/layout';
import {
	spacingSimpleFields,
	spacingSimpleGroup,
	spacingSimpleSchema,
} from '../../../registry/fields/spacing';
import {
	fontWeightField,
	fontWeightSchema,
	typographyGroup,
} from '../../../registry/fields/typography';

export const HeadingDefinition: ComponentDefinition = {
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
};
