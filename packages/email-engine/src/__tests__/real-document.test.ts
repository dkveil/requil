import type { Document } from '@requil/types/editor';
import { describe, expect, it } from 'vitest';
import {
	convertDocumentToHtml,
	convertDocumentToMjml,
} from '../block-ir-to-mjml';

describe('Real Document Test', () => {
	it('should convert real document from user without errors', () => {
		const document: Document = {
			version: '1.0',
			root: {
				id: 'PRiBwB0eOsK-DbuDlXsL7',
				type: 'Root',
				props: {
					fill: {
						color: '#F4F4F5',
					},
				},
				children: [
					{
						id: '2woe4ggWpH71NtkqchPRd',
						type: 'Block',
						props: {
							linkTo: null,
							width: '100%',
							height: 'auto',
							minWidth: null,
							maxWidth: null,
							align: 'flex-start',
							gap: 0,
							padding: 0,
							htmlTag: 'div',
							ariaLabel: '',
							opacity: 1,
							fill: null,
							border: null,
							radius: 0,
						},
						children: [
							{
								id: 'vIefH8z5VfvQRIgxcqYaA',
								type: 'Columns',
								props: {
									columnCount: 2,
									gap: 0,
									stackOnMobile: true,
									verticalAlign: 'top',
								},
								children: [
									{
										id: 'rv-nk2w4CBmbADdlTosv8',
										type: 'Column',
										props: {
											width: 'auto',
											height: 'auto',
											minWidth: null,
											maxWidth: null,
											opacity: 1,
											fill: null,
											border: null,
											radius: 0,
										},
									},
									{
										id: 'tBZ8aIPnIuR4Ls_jskJ9B',
										type: 'Column',
										props: {
											width: 'auto',
											height: 'auto',
											minWidth: null,
											maxWidth: null,
											opacity: 1,
											fill: null,
											border: null,
											radius: 0,
										},
									},
								],
							},
							{
								id: '5gn8U-EdLo-Z4oc43UZDm',
								type: 'Container',
								props: {
									linkTo: null,
									width: '100%',
									height: 'auto',
									minWidth: null,
									maxWidth: '600px',
									align: 'flex-start',
									gap: 0,
									padding: 20,
									opacity: 1,
									fill: null,
									border: null,
									radius: 0,
								},
								children: [
									{
										id: 'gvkJFuvxLRUAsgN67Ron_',
										type: 'Heading',
										props: {
											content: 'Your Heading',
											level: 'h2',
											fontSize: 32,
											fontWeight: '700',
											textAlign: 'left',
											lineHeight: 1.5,
											letterSpacing: 0,
											fontFamily: 'Arial, sans-serif',
											textColor: '#000000',
											align: 'flex-start',
											gap: 0,
											padding: 0,
											opacity: 1,
											fill: null,
											border: null,
											radius: 0,
										},
									},
									{
										id: 'DsaE9TwxWrILor2LQuIBJ',
										type: 'Button',
										props: {
											text: 'Click Me',
											action: 'link',
											href: '#',
											width: 'auto',
											height: 'auto',
											minWidth: null,
											maxWidth: null,
											align: 'center',
											gap: 0,
											padding: 12,
											fontSize: 16,
											fontWeight: '600',
											textAlign: 'center',
											lineHeight: 1.5,
											letterSpacing: 0,
											fontFamily: 'Arial, sans-serif',
											textColor: '#000000',
											opacity: 1,
											fill: {
												color: '#3B82F6',
											},
											border: null,
											radius: 0,
											borderRadius: 4,
										},
									},
									{
										id: 'ZatACzunT703d4Y9kg69S',
										type: 'Text',
										props: {
											content: 'Enter your text here...',
											fontSize: 16,
											fontWeight: '400',
											textAlign: 'left',
											lineHeight: 1.5,
											letterSpacing: 0,
											fontFamily: 'Arial, sans-serif',
											textColor: '#000000',
											align: 'flex-start',
											gap: 0,
											padding: 0,
											opacity: 1,
											fill: null,
											border: null,
											radius: 0,
										},
									},
								],
							},
							{
								id: 'ku0ieue3rG5gvf-x2LcHI',
								type: 'Quote',
								props: {
									text: 'This is a quote.',
									citation: '',
									align: 'flex-start',
									gap: 0,
									padding: {
										top: 12,
										right: 0,
										bottom: 12,
										left: 16,
									},
									fontSize: 16,
									fontWeight: '400',
									textAlign: 'left',
									lineHeight: 1.5,
									letterSpacing: 0,
									fontFamily: 'Arial, sans-serif',
									textColor: '#000000',
									opacity: 1,
									fill: null,
									border: null,
									radius: 0,
									fontStyle: 'italic',
								},
							},
							{
								id: 'GIAnM9vEzXq35DVksGcVo',
								type: 'List',
								props: {
									items: [
										{
											id: '1',
											text: 'List item 1',
										},
										{
											id: '2',
											text: 'List item 2',
										},
										{
											id: '3',
											text: 'List item 3',
										},
									],
									listType: 'bullet',
									showMarkers: true,
									markerColor: 'inherit',
									customMarker: '→',
									customMarkerColor: '#000000',
									fontSize: 16,
									fontWeight: '400',
									textAlign: 'left',
									lineHeight: 1.5,
									letterSpacing: 0,
									fontFamily: 'Arial, sans-serif',
									textColor: '#000000',
									align: 'flex-start',
									gap: 0,
									padding: {
										top: 12,
										right: 0,
										bottom: 12,
										left: 0,
									},
									opacity: 1,
									fill: null,
									border: null,
									radius: 0,
								},
							},
						],
					},
					{
						id: 'B5WcYBCWsCd-5ndIua0jK',
						type: 'SocialIcons',
						props: {
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
							align: 'center',
							gap: 0,
							padding: 10,
							opacity: 1,
							fill: null,
							border: null,
							radius: 0,
							fontSize: 16,
							fontWeight: '400',
							textAlign: 'left',
							lineHeight: 1.5,
							letterSpacing: 0,
							fontFamily: 'Arial, sans-serif',
							textColor: '#000000',
						},
					},
				],
			},
			metadata: {
				title: 'Untitled Template',
				createdAt: '2025-11-16T12:42:49.916Z',
				updatedAt: '2025-11-16T12:42:49.916Z',
			},
		};

		const mjmlResult = convertDocumentToMjml(document);

		expect(mjmlResult.errors).toHaveLength(0);
		expect(mjmlResult.mjml).toContain('<mjml>');

		const htmlResult = convertDocumentToHtml(document);

		expect(htmlResult.errors).toHaveLength(0);
		expect(htmlResult.html).toContain('<!doctype html>');
	});
});
