import { ComponentDefinition } from '@requil/types';
import {
	imageContentGroup,
	imageFields,
	imageSchema,
} from '../../../registry/fields/content';
import {
	alignField,
	alignSchema,
	borderRadiusField,
	borderRadiusSchema,
	imageLayoutGroup,
	widthField,
	widthSchema,
} from '../../../registry/fields/layout';
import {
	spacingSimpleFields,
	spacingSimpleGroup,
	spacingSimpleSchema,
} from '../../../registry/fields/spacing';

export const ImageDefinition: ComponentDefinition = {
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
};
