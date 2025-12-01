import type { Document } from '@requil/types/editor';
import { describe, it } from 'vitest';

// TODO: Re-enable after implementing block-ir-to-html
// import { convertDocumentToHtml } from '../block-ir-to-html';

describe.skip('Block Types Coverage', () => {
	it.skip('should handle all block types without errors', () => {
		const _testDocument: Document = {
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

		// TODO: Re-enable after implementing block-ir-to-html
		// const result = convertDocumentToHtml(_testDocument);
		// expect(result.errors).toHaveLength(0);
		// expect(result.html).toContain('<!doctype html>');
	});

	it.skip('should report error for unknown block type', () => {
		const _testDocument: Document = {
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

		// TODO: Re-enable after implementing block-ir-to-html
		// const result = convertDocumentToHtml(_testDocument);
		// expect(result.errors.length).toBeGreaterThan(0);
		// expect(result.errors[0]).toContain('Unknown block type');
	});
});
