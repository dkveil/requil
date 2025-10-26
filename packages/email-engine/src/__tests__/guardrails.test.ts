import { describe, expect, it } from 'vitest';
import { analyzeAndFixHtml } from '../../src/guardrails.js';

const ALT_REGEX = /alt/i;
const HTTP_REGEX = /HTTP/i;

describe('analyzeAndFixHtml', () => {
	it('detects missing alt, http links, size and adds noopener', () => {
		const html = `
      <html><body>
        <img src="x.png">
        <a href="http://example.com">x</a>
      </body></html>
    `;
		const res = analyzeAndFixHtml(html);
		expect(res.errors.join(' ')).toMatch(ALT_REGEX);
		expect(res.errors.join(' ')).toMatch(HTTP_REGEX);
		expect(res.html).toContain('rel="noopener"');
	});
});
