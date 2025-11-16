import type { Document } from '@requil/types/editor';
import { describe, expect, it } from 'vitest';
import { convertDocumentToMjml } from '../block-ir-to-mjml';

describe('Block Types Coverage', () => {
	it('should handle all block types without errors', () => {
		const testDocument: Document = {
			version: '1.0',
			root: {
				id: 'root',
				type: 'Root',
				props: {},
				children: [
					{
						id: 'container',
						type: 'Container',
						props: {},
						children: [
							{
								id: 'text',
								type: 'Text',
								props: { content: 'Test text' },
							},
						],
					},
					{
						id: 'block',
						type: 'Block',
						props: {},
						children: [
							{
								id: 'heading',
								type: 'Heading',
								props: { content: 'Test heading' },
							},
						],
					},
					{
						id: 'columns',
						type: 'Columns',
						props: { columnCount: 2 },
						children: [
							{
								id: 'col1',
								type: 'Column',
								props: {},
								children: [
									{
										id: 'button',
										type: 'Button',
										props: { text: 'Click me' },
									},
								],
							},
							{
								id: 'col2',
								type: 'Column',
								props: {},
								children: [
									{
										id: 'list',
										type: 'List',
										props: { items: ['Item 1', 'Item 2'] },
									},
								],
							},
						],
					},
					{
						id: 'quote',
						type: 'Quote',
						props: { text: 'Quote text' },
					},
					{
						id: 'social',
						type: 'SocialIcons',
						props: {
							icons: [
								{
									id: 'fb',
									network: 'facebook',
									href: 'https://facebook.com',
								},
							],
						},
					},
					{
						id: 'spacer',
						type: 'Spacer',
						props: { height: 20 },
					},
					{
						id: 'divider',
						type: 'Divider',
						props: {},
					},
					{
						id: 'image',
						type: 'Image',
						props: { src: 'https://example.com/image.jpg' },
					},
				],
			},
		};

		const result = convertDocumentToMjml(testDocument);

		expect(result.errors).toHaveLength(0);
		expect(result.mjml).toContain('<mjml>');
		expect(result.mjml).toContain('</mjml>');
		expect(result.mjml).toContain('mj-text');
		expect(result.mjml).toContain('mj-button');
		expect(result.mjml).toContain('mj-section');
		expect(result.mjml).toContain('mj-column');
	});

	it('should report error for unknown block type', () => {
		const testDocument: Document = {
			version: '1.0',
			root: {
				id: 'root',
				type: 'Root',
				props: {},
				children: [
					{
						id: 'unknown',
						type: 'UnknownBlockType',
						props: {},
					},
				],
			},
		};

		const result = convertDocumentToMjml(testDocument);

		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors[0]).toContain('Unknown block type');
	});
});
