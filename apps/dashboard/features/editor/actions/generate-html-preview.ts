'use server';

import { convertDocumentToHtml } from '@requil/email-engine';
import type { Document } from '@requil/types/editor';

export type HtmlPreviewResult = {
	success: boolean;
	html?: string;
	warnings?: string[];
	errors?: string[];
};

export async function generateHtmlPreview(
	document: Document | null
): Promise<HtmlPreviewResult> {
	if (!document) {
		return {
			success: false,
			errors: ['No document provided'],
		};
	}

	try {
		const result = convertDocumentToHtml(document);

		return {
			success: result.errors.length === 0,
			html: result.html,
			warnings: result.warnings,
			errors: result.errors,
		};
	} catch (error) {
		return {
			success: false,
			errors: [
				`Failed to generate HTML: ${error instanceof Error ? error.message : String(error)}`,
			],
		};
	}
}
