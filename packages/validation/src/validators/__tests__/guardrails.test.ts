import { describe, expect, it } from 'vitest';
import { checkImageAltText } from '../guardrails';

describe('guardrails', () => {
	describe('checkImageAltText', () => {
		it('should return true if the image has alt text', () => {
			const html = '<img src="logo.png" alt="Logo">';
			const result = checkImageAltText(html);

			expect(result.passed).toBe(true);
			expect(result.details?.total).toBe(1);
			expect(result.details?.missing).toBe(0);
		});
		it('should fail when all images wihout alt text', () => {
			const html = '<img src="logo.png"><img src="icon.png">';
			const result = checkImageAltText(html);

			expect(result.passed).toBe(false);
			expect(result.message).toBe('2 images missing alt text');
			expect(result.details?.total).toBe(2);
			expect(result.details?.missing).toBe(2);
		});
		it('should handle multiple images without alt text', () => {
			const html = '<img src="a.png"><img src="b.png"><img src="c.png">';
			const result = checkImageAltText(html);

			expect(result.passed).toBe(false);
			expect(result.message).toBe('3 images missing alt text');
			expect(result.details?.missing).toBe(3);
		});
		it('should pass when there are no images', () => {
			const html = '<p>No images here</p>';
			const result = checkImageAltText(html);

			expect(result.passed).toBe(true);
			expect(result.details?.total).toBe(0);
			expect(result.details?.missing).toBe(0);
		});
	});
});
