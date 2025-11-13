import { ComponentDefinition } from '@requil/types';
import { colorField, colorSchema } from '../../../registry/fields/colors';
import {
	contentField,
	contentGroup,
	contentSchema,
} from '../../../registry/fields/content';
import {
	styleGroup,
	textAlignField,
	textAlignSchema,
} from '../../../registry/fields/layout';
import {
	paddingFields,
	paddingSchema,
	spacingGroup,
} from '../../../registry/fields/spacing';
import {
	typographyFields,
	typographyGroup,
	typographySchema,
} from '../../../registry/fields/typography';

export const TextDefinition: ComponentDefinition = {
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
};
