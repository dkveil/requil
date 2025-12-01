import type { Document } from '@requil/types/editor';

export type HtmlConversionResult = {
	html: string;
	warnings: string[];
	errors: string[];
};

export function convertDocumentToHtml(
	document: Document
): HtmlConversionResult {
	const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${document.metadata?.title || 'Email Template'}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
              <tr>
                <td style="padding: 20px; background-color: #ffffff;">
                  <h1 style="margin: 0 0 20px 0; color: #333333;">Preview Placeholder</h1>
                  <p style="margin: 0 0 10px 0; color: #666666;">
                    The new HTML converter is being implemented.
                  </p>
                  <p style="margin: 0; color: #666666; font-size: 14px;">
                    Document ID: ${document.root.id}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
	`.trim();

	return {
		html,
		warnings: [
			'Using temporary placeholder HTML - block-ir-to-html not yet implemented',
		],
		errors: [],
	};
}
