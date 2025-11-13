import { ComponentDefinition } from '@requil/types';
import {
	backgroundColorField,
	backgroundColorSchema,
	textColorField,
	textColorSchema,
} from '../../../registry/fields/colors';
import {
	buttonContentGroup,
	buttonFields,
	buttonSchema,
} from '../../../registry/fields/content';
import {
	alignField,
	alignSchema,
	borderRadiusButtonSchema,
	borderRadiusField,
	fullWidthField,
	fullWidthSchema,
	layoutGroup,
} from '../../../registry/fields/layout';
import {
	spacingButtonFields,
	spacingButtonSchema,
} from '../../../registry/fields/spacing';
import {
	fontWeightField,
	fontWeightSchema,
} from '../../../registry/fields/typography';

export const ButtonDefinition: ComponentDefinition = {
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
				fields: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
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
};
