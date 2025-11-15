import { createFieldGroup } from './config';

export const linkGroup = createFieldGroup({
	id: 'link',
	label: 'Link',
	fields: {
		linkTo: {
			schema: {
				type: 'object',
				default: null,
			},
			field: {
				key: 'linkTo',
				label: 'Link To',
				type: 'group',
				isCollapsible: false,
				isAddable: true,
				emptyLabel: 'Add...',
				children: [
					{
						key: 'href',
						label: 'Link URL',
						type: 'text',
						placeholder: 'https://example.com',
					},
					{
						key: 'target',
						label: 'New tab',
						type: 'toggle',
						defaultValue: false,
					},
				],
			},
		},
	},
});
