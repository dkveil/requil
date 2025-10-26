import {
	checkEmailSize,
	checkHttpsLinks,
	checkImageAltText,
} from '@requil/validation';
import { load } from 'cheerio';

const WHITESPACE_REGEX = /\s+/;

const ensureNoopener = (html: string): { html: string; changed: boolean } => {
	const $ = load(html);
	let changed = false;
	$('a[href]').each((_, el) => {
		const rel = $(el).attr('rel') || '';
		if (!rel.split(WHITESPACE_REGEX).includes('noopener')) {
			const next = rel ? `${rel} noopener` : 'noopener';
			$(el).attr('rel', next);
			changed = true;
		}
	});
	return { html: $.html(), changed };
};

export const analyzeAndFixHtml = (
	html: string
): {
	html: string;
	errors: string[];
	warnings: string[];
	sizeBytes: number;
} => {
	const withNoopener = ensureNoopener(html);
	const alt = checkImageAltText(withNoopener.html);
	const https = checkHttpsLinks(withNoopener.html);
	const size = checkEmailSize(withNoopener.html);
	const errors: string[] = [];
	const warnings: string[] = [];
	if (!alt.passed && alt.message) errors.push(alt.message);
	if (!https.passed && https.message) errors.push(https.message);
	if (!size.passed && size.message) errors.push(size.message);
	const sizeBytes = Buffer.byteLength(withNoopener.html, 'utf8');
	return { html: withNoopener.html, errors, warnings, sizeBytes };
};
