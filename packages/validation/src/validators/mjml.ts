import { XMLParser } from 'fast-xml-parser';

const LINE_REGEX = /line:?\s*(\d+)/i;

export interface MjmlValidationResult {
	valid: boolean;
	errors?: Array<{
		message: string;
		line?: number;
	}>;
}

/**
 * @example Valid MJML
 * const result = validateMjmlSyntax('<mjml><mj-body><mj-text>Hello</mj-text></mj-body></mjml>');
 * // { valid: true }
 *
 * @example Invalid MJML
 * const result = validateMjmlSyntax('<mjml><mj-body><mj-text>Unclosed');
 * // { valid: false, errors: [{ message: 'Unclosed tag', line: 1 }] }
 */
export function validateMjmlSyntax(mjml: string): MjmlValidationResult {
	const parser = new XMLParser({
		ignoreAttributes: false,
		parseAttributeValue: false,
	});

	try {
		const parsed = parser.parse(mjml);

		if (!parsed.mjml) {
			return {
				valid: false,
				errors: [{ message: 'Missing <mjml> root element' }],
			};
		}

		return { valid: true };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Invalid XML syntax';
		const lineMatch = errorMessage.match(LINE_REGEX);
		const line = lineMatch
			? Number.parseInt(lineMatch[1] ?? '0', 10)
			: undefined;

		return {
			valid: false,
			errors: [
				{
					message: errorMessage,
					line,
				},
			],
		};
	}
}

/**
 * @example
 * const variables = extractMjmlVariables('<mj-text>Hello {{firstName}} {{lastName}}</mj-text>');
 * // ['firstName', 'lastName']
 */
export function extractMjmlVariables(mjml: string): string[] {
	const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*\}\}/g;
	const matches = [...mjml.matchAll(regex)];
	const variables = new Set(matches.map((match) => match[1] ?? ''));
	return Array.from(variables);
}

/**
 * @example
 * const hasUnclosed = hasUnclosedTags('<mj-text>Hello</mj-text><mj-button>');
 * // true
 */
export function hasUnclosedTags(mjml: string): boolean {
	const result = validateMjmlSyntax(mjml);
	return !result.valid;
}
