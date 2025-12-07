import { ComponentDefinition } from '@requil/types';
import {
	getLayoutGroup,
	sizeGroup,
	stylesGroup,
} from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';

const layoutGroup = getLayoutGroup();

export const imageGroup = createFieldGroup({
	id: 'image',
	label: 'Image',
	fields: {
		src: {
			schema: {
				type: 'string',
				default: '',
			},
			field: {
				key: 'src',
				label: 'Image Source',
				type: 'image',
				placeholder: 'https://example.com/image.png',
			},
		},
		alt: {
			schema: {
				type: 'string',
				default: '',
			},
			field: {
				key: 'alt',
				label: 'Alt Text',
				type: 'text',
				placeholder: 'Image description',
			},
		},
	},
});

export const ImageDefinition: ComponentDefinition = {
	type: 'Image',
	category: 'content',
	name: 'Image',
	description: 'Image',
	icon: 'Image',

	allowedChildren: [],
	allowedParents: ['Root', 'Container', 'Section'],

	propsSchema: {
		type: 'object',
		properties: {
			...imageGroup.schema,
			...layoutGroup.schema,
			...sizeGroup.schema,
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...imageGroup.defaults,
		...layoutGroup.defaults,
		...sizeGroup.defaults,
		...stylesGroup.defaults,
		width: '100%',
		height: 'auto',
		margin: {
			top: 0,
			right: 'auto',
			bottom: 0,
			left: 'auto',
		},
	},

	inspectorConfig: {
		groups: [
			imageGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			sizeGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...imageGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...sizeGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
