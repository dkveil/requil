import { htmlToText } from 'html-to-text';

export const toPlaintext = (html: string): string => {
	return htmlToText(html, {
		wordwrap: 80,
		selectors: [
			{ selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
			{ selector: 'img', format: 'skip' },
		],
	});
};
