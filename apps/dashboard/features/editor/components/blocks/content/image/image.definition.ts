import { ComponentDefinition } from '@requil/types';
import {
	layoutGroup,
	stylesGroup,
} from '@/features/editor/registry/field-groups';
import { createFieldGroup } from '@/features/editor/registry/field-groups/config';

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
		width: {
			schema: {
				type: 'string',
				default: '',
			},
			field: {
				key: 'width',
				label: 'Width',
				type: 'text',
				placeholder: '100% or 600px',
			},
		},
		height: {
			schema: {
				type: 'string',
				default: '',
			},
			field: {
				key: 'height',
				label: 'Height',
				type: 'text',
				placeholder: 'auto or 300px',
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
			...stylesGroup.schema,
		},
	},

	defaultProps: {
		...imageGroup.defaults,
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		width: '100%',
		height: 'auto',
	},

	inspectorConfig: {
		groups: [
			imageGroup.inspectorGroup,
			layoutGroup.inspectorGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...imageGroup.inspectorFields,
			...layoutGroup.inspectorFields,
			...stylesGroup.inspectorFields,
		],
	},
};
