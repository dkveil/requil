import { describe, expect, it } from 'vitest';
import { toPlaintext } from '../../src/plaintext';

const IMAGE_SRC_REGEX = /x\.jpg/;
const EXAMPLE_REGEX = /example/;

describe('toPlaintext', () => {
	it('converts links and skips images', () => {
		const html =
			'<p>Link <a href="https://example.com">example</a> <img src="x.jpg" alt="x"></p>';
		const text = toPlaintext(html);
		expect(text).toMatch(EXAMPLE_REGEX);
		expect(text).not.toMatch(IMAGE_SRC_REGEX);
	});
});
