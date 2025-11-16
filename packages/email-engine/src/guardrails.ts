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

const checkImageAltText = (
	html: string
): { passed: boolean; message?: string } => {
	const $ = load(html);
	const imagesWithoutAlt: string[] = [];
	$('img').each((_, el) => {
		const alt = $(el).attr('alt');
		if (!alt || alt.trim() === '') {
			const src = $(el).attr('src') || 'unknown';
			imagesWithoutAlt.push(src);
		}
	});
	if (imagesWithoutAlt.length > 0) {
		return {
			passed: false,
			message: `Images without alt text: ${imagesWithoutAlt.join(', ')}`,
		};
	}
	return { passed: true };
};

const checkHttpsLinks = (
	html: string
): { passed: boolean; message?: string } => {
	const $ = load(html);
	const httpLinks: string[] = [];
	$('a[href], img[src]').each((_, el) => {
		const href = $(el).attr('href') || $(el).attr('src');
		if (href?.startsWith('http://')) {
			httpLinks.push(href);
		}
	});
	if (httpLinks.length > 0) {
		return {
			passed: false,
			message: `Insecure HTTP links found: ${httpLinks.join(', ')}`,
		};
	}
	return { passed: true };
};

const checkEmailSize = (
	html: string
): { passed: boolean; message?: string } => {
	const sizeBytes = Buffer.byteLength(html, 'utf8');
	const maxSize = 102 * 1024; // 102KB (Gmail clips at 102KB)
	if (sizeBytes > maxSize) {
		return {
			passed: false,
			message: `Email size (${Math.round(sizeBytes / 1024)}KB) exceeds recommended limit (${Math.round(maxSize / 1024)}KB)`,
		};
	}
	return { passed: true };
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
	if (!alt.passed && alt.message) warnings.push(alt.message);
	if (!https.passed && https.message) warnings.push(https.message);
	if (!size.passed && size.message) warnings.push(size.message);
	const sizeBytes = Buffer.byteLength(withNoopener.html, 'utf8');
	return { html: withNoopener.html, errors, warnings, sizeBytes };
};
