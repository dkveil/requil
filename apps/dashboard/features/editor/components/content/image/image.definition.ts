import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	linkGroup,
	sizeGroup,
	stylesGroup,
} from '../../../registry/field-groups';

const imageFields = [
	{
		key: 'src',
		label: 'Image',
		type: 'image' as const,
		placeholder: 'https://example.com/image.jpg',
	},
	{
		key: 'alt',
		label: 'Alt Text',
		type: 'text' as const,
		placeholder: 'Image description',
	},
];

const imageContentGroup = {
	id: 'content',
	label: 'Content',
	fields: ['src', 'alt'],
};

export const ImageDefinition: ComponentDefinition = {
	type: 'Image',
	category: 'content',
	name: 'Image',
	description: 'Image block',
	icon: 'Image',

	allowedParents: ['Section', 'Column', 'Block'],

	propsSchema: {
		type: 'object',
		properties: {
			src: { type: 'string', default: 'https://via.placeholder.com/600x300' },
			alt: { type: 'string', default: 'Image description' },
			...linkGroup.schema,
			...sizeGroup.schema,
			...layoutGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		src: 'https://via.placeholder.com/600x300',
		alt: 'Image description',
		...linkGroup.defaults,
		...sizeGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
	},

	inspectorConfig: {
		groups: [
			imageContentGroup,
			linkGroup.inspectorGroup,
			sizeGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...imageFields,
			...linkGroup.inspectorFields,
			...sizeGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-image',
};
