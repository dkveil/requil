import { createFieldGroup } from './config';

export const accessibilityGroup = createFieldGroup({
	id: 'accessibility',
	label: 'Accessibility',
	fields: {
		htmlTag: {
			schema: {
				enum: ['div', 'section', 'article', 'header', 'footer', 'main', 'nav'],
				default: 'div',
			},
			field: {
				key: 'htmlTag',
				label: 'HTML Tag',
				type: 'htmlTag',
				options: [
					{ label: 'div', value: 'div' },
					{ label: 'section', value: 'section' },
					{ label: 'article', value: 'article' },
					{ label: 'header', value: 'header' },
					{ label: 'footer', value: 'footer' },
					{ label: 'main', value: 'main' },
					{ label: 'nav', value: 'nav' },
				],
			},
		},

		ariaLabel: {
			schema: {
				type: 'string',
				default: '',
				placeholder: 'Enter aria label',
			},
			field: {
				key: 'ariaLabel',
				label: 'Aria Label',
				type: 'text',
				placeholder: 'Enter aria label',
			},
		},
	},
});
