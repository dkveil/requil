import type { ComponentDefinition } from '@requil/types/editor';
import {
	layoutGroup,
	stylesGroup,
	typographyGroup,
} from '../../../registry/field-groups';

const socialIconsContentFields = [
	{
		key: 'icons',
		label: 'Items',
		type: 'array' as const,
		itemTitle: 'Social',
		itemTitleKey: 'network',
		children: [
			{
				key: 'network',
				label: 'Network',
				type: 'select' as const,
				options: [
					{ label: 'Facebook', value: 'facebook' },
					{ label: 'Twitter', value: 'twitter' },
					{ label: 'Instagram', value: 'instagram' },
					{ label: 'LinkedIn', value: 'linkedin' },
					{ label: 'YouTube', value: 'youtube' },
					{ label: 'GitHub', value: 'github' },
					{ label: 'Pinterest', value: 'pinterest' },
					{ label: 'Snapchat', value: 'snapchat' },
					{ label: 'TikTok', value: 'tiktok' },
					{ label: 'Dribbble', value: 'dribbble' },
					{ label: 'Website', value: 'web' },
				],
			},
			{
				key: 'href',
				label: 'URL',
				type: 'text' as const,
				placeholder: 'https://...',
			},
			{
				key: 'alt',
				label: 'Alt Text',
				type: 'text' as const,
				placeholder: 'Optional',
			},
		],
	},
	{
		key: 'mode',
		label: 'Mode',
		type: 'select' as const,
		options: [
			{ label: 'Horizontal', value: 'horizontal' },
			{ label: 'Vertical', value: 'vertical' },
		],
	},
	{
		key: 'iconSize',
		label: 'Icon Size',
		type: 'text' as const,
		placeholder: '20px',
	},
	{
		key: 'iconColor',
		label: 'Icon Color (Fill)',
		type: 'color' as const,
		placeholder: '#000000',
	},
	{
		key: 'textMode',
		label: 'Show Text Labels',
		type: 'toggle' as const,
	},
	{
		key: 'textPosition',
		label: 'Text Position',
		type: 'select' as const,
		options: [
			{ label: 'Beside Icon', value: 'beside' },
			{ label: 'Below Icon', value: 'below' },
		],
		condition: {
			field: 'textMode',
			operator: 'truthy' as const,
			value: true,
		},
	},
];

const socialIconsContentGroup = {
	id: 'content',
	label: 'Social icons',
	fields: [
		'icons',
		'mode',
		'iconSize',
		'iconColor',
		'textMode',
		'textPosition',
	],
};

// Create conditional typography group
const conditionalTypographyGroup = {
	...typographyGroup.inspectorGroup,
	condition: {
		field: 'textMode',
		operator: 'truthy' as const,
		value: true,
	},
};

// Apply condition to all typography fields
const conditionalTypographyFields = typographyGroup.inspectorFields.map(
	(field) => ({
		...field,
		condition: {
			field: 'textMode',
			operator: 'truthy' as const,
			value: true,
		},
	})
);

export const socialIconsDefinition: ComponentDefinition = {
	type: 'SocialIcons',
	category: 'content',
	name: 'Social Icons',
	description: 'Social media icons with links',
	icon: 'Share2',

	allowedParents: ['Block', 'Section', 'Column'],

	propsSchema: {
		type: 'object',
		properties: {
			// Array of social icons with network, href, and optional alt text
			// Available networks: facebook, twitter, instagram, linkedin, youtube,
			// github, pinterest, snapchat, tiktok, dribbble, web
			// Custom icons support coming soon
			icons: {
				type: 'array',
				default: [
					{
						id: '1',
						network: 'facebook',
						href: 'https://facebook.com',
						alt: 'Facebook',
					},
					{
						id: '2',
						network: 'twitter',
						href: 'https://twitter.com',
						alt: 'Twitter',
					},
					{
						id: '3',
						network: 'instagram',
						href: 'https://instagram.com',
						alt: 'Instagram',
					},
				],
			},
			mode: { type: 'string', default: 'horizontal' },
			iconSize: { type: 'string', default: '20px' },
			iconColor: { type: 'string', default: '#000000' },
			textMode: { type: 'boolean', default: false },
			textPosition: { type: 'string', default: 'beside' },
			...layoutGroup.schema,
			...stylesGroup.schema,
			...typographyGroup.schema,
		},
	},

	defaultProps: {
		icons: [
			{
				id: '1',
				network: 'facebook',
				href: 'https://facebook.com',
				alt: 'Facebook',
			},
			{
				id: '2',
				network: 'twitter',
				href: 'https://twitter.com',
				alt: 'Twitter',
			},
			{
				id: '3',
				network: 'instagram',
				href: 'https://instagram.com',
				alt: 'Instagram',
			},
		],
		mode: 'horizontal',
		iconSize: '20px',
		iconColor: '#000000',
		textMode: false,
		textPosition: 'beside',
		...layoutGroup.defaults,
		...stylesGroup.defaults,
		...typographyGroup.defaults,
		align: 'center',
		padding: 10,
	},

	inspectorConfig: {
		groups: [
			socialIconsContentGroup,
			layoutGroup.inspectorGroup,
			conditionalTypographyGroup,
			stylesGroup.inspectorGroup,
		],
		fields: [
			...socialIconsContentFields,
			...layoutGroup.inspectorFields,
			...conditionalTypographyFields,
			...stylesGroup.inspectorFields,
		],
	},

	mjmlTag: 'mj-social',
};
