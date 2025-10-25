import { describe, expect, it } from 'vitest';
import {
	checkContrast,
	checkEmailSize,
	checkHttpsLinks,
	checkImageAltText,
	runAllGuardrails,
} from '../guardrails';

const KB_REGEX = /\d+\.\d+KB/;

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

	describe('checkHttpsLinks', () => {
		it('should return passed true with 2 https links', () => {
			const html =
				'<a href="https://example.com">Link</a><a href="https://example-second.com">Link</a>';
			const result = checkHttpsLinks(html);

			expect(result.passed).toBe(true);
			expect(result.details?.http).toBe(0);
			expect(result.details?.https).toBe(2);
		});
		it('should return passed true with 2 https links', () => {
			const html =
				'<a href="http://example.com">Link</a><a href="http://example-second.com">Link</a>';
			const result = checkHttpsLinks(html);

			expect(result.passed).toBe(false);
			expect(result.message).toBe('2 links using HTTP instead of HTTPS');
			expect(result.details?.http).toBe(2);
			expect(result.details?.https).toBe(0);
		});
		it('should return passed true with 1 http and 1 https links', () => {
			const html =
				'<a href="http://example.com">Link</a><a href="https://example-second.com">Link</a>';
			const result = checkHttpsLinks(html);

			expect(result.passed).toBe(false);
			expect(result.message).toBe('1 link using HTTP instead of HTTPS');
			expect(result.details?.http).toBe(1);
			expect(result.details?.https).toBe(1);
		});
		it('should pass when there are no links', () => {
			const html = '<p>No links here</p>';
			const result = checkHttpsLinks(html);

			expect(result.passed).toBe(true);
			expect(result.details?.http).toBe(0);
		});
	});

	describe('checkEmailSize', () => {
		it('should pass when email is under default limit', () => {
			const html = '<html><body><p>Small email</p></body></html>';
			const result = checkEmailSize(html);

			expect(result.passed).toBe(true);
			expect(result.details?.size).toBeLessThan(102400);
			expect(result.details?.limit).toBe(102400);
		});

		it('should fail when email exceeds default limit', () => {
			const html = `<html><body>${'x'.repeat(200000)}</body></html>`;
			const result = checkEmailSize(html);

			expect(result.passed).toBe(false);
			expect(result.message).toContain('exceeds limit');
			expect(result.details?.size).toBeGreaterThan(102400);
		});

		it('should respect custom limit', () => {
			const html = `<html><body>${'x'.repeat(1000)}</body></html>`;
			const customLimit = 500;
			const result = checkEmailSize(html, customLimit);

			expect(result.passed).toBe(false);
			expect(result.details?.limit).toBe(customLimit);
		});

		it('should pass when email equals limit', () => {
			const html = 'x'.repeat(1000);
			const result = checkEmailSize(html, 1000);

			expect(result.passed).toBe(true);
		});

		it('should handle empty email', () => {
			const html = '';
			const result = checkEmailSize(html);

			expect(result.passed).toBe(true);
			expect(result.details?.size).toBe(0);
		});

		it('should include size in KB in error message', () => {
			const html = 'x'.repeat(150000);
			const result = checkEmailSize(html, 100000);

			expect(result.passed).toBe(false);
			expect(result.message).toMatch(KB_REGEX);
		});
	});

	describe('checkContrast', () => {
		it('should pass with good contrast (black on white)', () => {
			const result = checkContrast('#000000', '#FFFFFF');

			expect(result.passed).toBe(true);
			expect(result.details?.ratio).toBeGreaterThan(4.5);
		});

		it('should fail with poor contrast (white on light gray)', () => {
			const result = checkContrast('#FFFFFF', '#F0F0F0');

			expect(result.passed).toBe(false);
			expect(result.message).toContain('Insufficient contrast ratio');
			expect(result.details?.ratio).toBeLessThan(4.5);
		});

		it('should handle hex colors without # prefix', () => {
			const result = checkContrast('000000', 'FFFFFF');

			expect(result.passed).toBe(true);
		});

		it('should handle 3-character hex colors', () => {
			const result = checkContrast('#000', '#FFF');

			expect(result.passed).toBe(true);
		});

		it('should respect custom minimum ratio', () => {
			const result = checkContrast('#666666', '#FFFFFF', 3.0);

			expect(result.passed).toBe(true);
			expect(result.details?.minimum).toBe(3.0);
		});

		it('should calculate correct contrast ratio', () => {
			const result = checkContrast('#000000', '#FFFFFF');

			expect(result.details?.ratio).toBe(21);
		});

		it('should handle same colors (minimum contrast)', () => {
			const result = checkContrast('#FFFFFF', '#FFFFFF');

			expect(result.passed).toBe(false);
			expect(result.details?.ratio).toBe(1);
		});

		it('should handle lowercase hex colors', () => {
			const result = checkContrast('#ffffff', '#000000');

			expect(result.passed).toBe(true);
		});

		it('should format ratio to 2 decimal places', () => {
			const result = checkContrast('#767676', '#FFFFFF');

			expect(typeof result.details?.ratio).toBe('number');
			expect(result.details?.ratio).toBeGreaterThan(0);
		});

		it('should handle inverted colors equally', () => {
			const result1 = checkContrast('#000000', '#FFFFFF');
			const result2 = checkContrast('#FFFFFF', '#000000');

			expect(result1.details?.ratio).toBe(result2.details?.ratio);
		});
	});

	describe('runAllGuardrails', () => {
		it('should run all guardrails and return results', () => {
			const html =
				'<html><body><img src="logo.png" alt="Logo"><a href="https://example.com">Link</a></body></html>';
			const results = runAllGuardrails(html);

			expect(results).toHaveProperty('altText');
			expect(results).toHaveProperty('httpsLinks');
			expect(results).toHaveProperty('size');
		});

		it('should detect all failures', () => {
			const html =
				'<html><body>' +
				'x'.repeat(150000) +
				'<img src="logo.png"><a href="http://example.com">Link</a></body></html>';
			const results = runAllGuardrails(html);

			expect(results.altText.passed).toBe(false);
			expect(results.httpsLinks.passed).toBe(false);
			expect(results.size.passed).toBe(false);
		});

		it('should pass all guardrails with valid content', () => {
			const html =
				'<html><body><img src="logo.png" alt="Logo"><a href="https://example.com">Link</a></body></html>';
			const results = runAllGuardrails(html);

			expect(results.altText.passed).toBe(true);
			expect(results.httpsLinks.passed).toBe(true);
			expect(results.size.passed).toBe(true);
		});

		it('should handle empty HTML', () => {
			const html = '';
			const results = runAllGuardrails(html);

			expect(results.altText.passed).toBe(true);
			expect(results.httpsLinks.passed).toBe(true);
			expect(results.size.passed).toBe(true);
		});

		it('should return detailed information for each guardrail', () => {
			const html = '<html><body><img src="logo.png" alt="Logo"></body></html>';
			const results = runAllGuardrails(html);

			expect(results.altText.details).toBeDefined();
			expect(results.httpsLinks.details).toBeDefined();
			expect(results.size.details).toBeDefined();
		});
	});
});
