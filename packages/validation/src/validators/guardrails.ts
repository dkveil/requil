export interface GuardrailResult {
	passed: boolean;
	message?: string;
	details?: Record<string, unknown>;
}

const MAX_EMAIL_SIZE = 102_400;
const IMG_REGEX = /<img[^>]*>/gi;
const LINK_REGEX = /href\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
const HEX_SANITIZE_REGEX = /^#/;
const ALT_REGEX = /alt\s*=\s*["'][^"']+["']/i;

/**
 * @example
 * const result = checkImageAltText('<img src="logo.png"><img src="icon.png" alt="Icon">');
 * // { passed: false, message: '1 images missing alt text', details: { total: 2, missing: 1 } }
 */
export function checkImageAltText(html: string): GuardrailResult {
	const images = html.match(IMG_REGEX) || [];

	const missingAlt = images.filter((img) => {
		const hasAlt = ALT_REGEX.test(img);
		return !hasAlt;
	});

	if (missingAlt.length > 0) {
		return {
			passed: false,
			message: `${missingAlt.length} image${missingAlt.length > 1 ? 's' : ''} missing alt text`,
			details: {
				total: images.length,
				missing: missingAlt.length,
			},
		};
	}

	return {
		passed: true,
		details: {
			total: images.length,
			missing: 0,
		},
	};
}

/**
 * @example
 * const result = checkHttpsLinks('<a href="http://example.com">Link</a>');
 * // { passed: false, message: '1 links using HTTP instead of HTTPS', details: { http: 1, https: 0 } }
 */
export function checkHttpsLinks(html: string): GuardrailResult {
	const links = [...html.matchAll(LINK_REGEX)];

	const httpLinks = links.filter((match) => match[1]?.startsWith('http://'));
	const httpsLinks = links.filter((match) => match[1]?.startsWith('https://'));

	if (httpLinks.length > 0) {
		return {
			passed: false,
			message: `${httpLinks.length} link${httpLinks.length > 1 ? 's' : ''} using HTTP instead of HTTPS`,
			details: {
				http: httpLinks.length,
				https: httpsLinks.length,
			},
		};
	}

	return {
		passed: true,
		details: {
			http: 0,
			https: httpsLinks.length,
		},
	};
}

/**
 * @example
 * const result = checkEmailSize('<html><body>' + 'x'.repeat(200000) + '</body></html>');
 * // { passed: false, message: 'Email size exceeds limit', details: { size: 200020, limit: 102400 } }
 */
export function checkEmailSize(
	html: string,
	limit: number = MAX_EMAIL_SIZE
): GuardrailResult {
	const size = Buffer.byteLength(html, 'utf8');

	if (size > limit) {
		return {
			passed: false,
			message: `Email size (${(size / 1024).toFixed(1)}KB) exceeds limit (${(limit / 1024).toFixed(1)}KB)`,
			details: {
				size,
				limit,
			},
		};
	}

	return {
		passed: true,
		details: {
			size,
			limit,
		},
	};
}

/**
 * @example
 * const result = checkContrast('#FFFFFF', '#F0F0F0');
 * // { passed: false, message: 'Insufficient contrast ratio', details: { ratio: 1.2, minimum: 4.5 } }
 */
export function checkContrast(
	foreground: string,
	background: string,
	minRatio = 4.5
): GuardrailResult {
	const ratio = calculateContrastRatio(foreground, background);

	if (ratio < minRatio) {
		return {
			passed: false,
			message: `Insufficient contrast ratio (${ratio.toFixed(2)}:1, minimum ${minRatio}:1)`,
			details: {
				ratio: Number.parseFloat(ratio.toFixed(2)),
				minimum: minRatio,
			},
		};
	}

	return {
		passed: true,
		details: {
			ratio: Number.parseFloat(ratio.toFixed(2)),
			minimum: minRatio,
		},
	};
}

function calculateContrastRatio(color1: string, color2: string): number {
	const l1 = getRelativeLuminance(color1);
	const l2 = getRelativeLuminance(color2);

	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);

	return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: string): number {
	const rgb = hexToRgb(color);
	if (!rgb) return 0;

	const normalized = rgb.map((val) => {
		const norm = val / 255;
		return norm <= 0.03928 ? norm / 12.92 : ((norm + 0.055) / 1.055) ** 2.4;
	});

	const r = normalized[0];
	const g = normalized[1];
	const b = normalized[2];

	if (r === undefined || g === undefined || b === undefined) {
		return 0;
	}

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] | null {
	const sanitized = hex.replace(HEX_SANITIZE_REGEX, '');

	if (sanitized.length === 3) {
		const parts = sanitized
			.split('')
			.map((char) => Number.parseInt(char + char, 16));
		const r = parts[0];
		const g = parts[1];
		const b = parts[2];

		const isInvalid =
			r === undefined ||
			g === undefined ||
			b === undefined ||
			Number.isNaN(r) ||
			Number.isNaN(g) ||
			Number.isNaN(b);

		if (isInvalid) {
			return null;
		}

		return [r, g, b];
	}

	if (sanitized.length === 6) {
		const r = Number.parseInt(sanitized.slice(0, 2), 16);
		const g = Number.parseInt(sanitized.slice(2, 4), 16);
		const b = Number.parseInt(sanitized.slice(4, 6), 16);

		const isInvalid = Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b);

		if (isInvalid) {
			return null;
		}

		return [r, g, b];
	}

	return null;
}

/**
 * @example
 * const results = runAllGuardrails('<html><body><img src="logo.png"><a href="http://example.com">Link</a></body></html>');
 * // {
 * //   altText: { passed: false, ... },
 * //   httpsLinks: { passed: false, ... },
 * //   size: { passed: true, ... }
 * // }
 */
export function runAllGuardrails(
	html: string
): Record<string, GuardrailResult> {
	return {
		altText: checkImageAltText(html),
		httpsLinks: checkHttpsLinks(html),
		size: checkEmailSize(html),
	};
}
