import type { ComponentDefinition } from '@requil/types/editor';

export const SpacerDefinition: ComponentDefinition = {
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
};
