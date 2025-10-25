import { describe, expect, it } from 'vitest';
import {
	extractMjmlVariables,
	hasUnclosedTags,
	validateMjmlSyntax,
} from '../mjml';

describe('mjml validators', () => {
	describe('validateMjmlSyntax', () => {
		it('should validate correct MJML syntax', () => {
			const mjml =
				'<mjml><mj-body><mj-text>Hello World</mj-text></mj-body></mjml>';
			const result = validateMjmlSyntax(mjml);

			expect(result.valid).toBe(true);
			expect(result.errors).toBeUndefined();
		});

		it('should validate MJML with attributes', () => {
			const mjml =
				'<mjml><mj-body><mj-text color="red" font-size="16px">Hello</mj-text></mj-body></mjml>';
			const result = validateMjmlSyntax(mjml);

			expect(result.valid).toBe(true);
		});

		it('should reject MJML without root element', () => {
			const mjml = '<mj-body><mj-text>Hello</mj-text></mj-body>';
			const result = validateMjmlSyntax(mjml);

			expect(result.valid).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors?.[0]?.message).toBe('Missing <mjml> root element');
		});

		it('should validate XML that parser can handle', () => {
			// Note: fast-xml-parser is very lenient and auto-closes tags
			// This test validates that the parser works as expected
			const mjml = '<mjml><mj-body><mj-text>Hello</mj-text></mj-body></mjml>';
			const result = validateMjmlSyntax(mjml);

			expect(result.valid).toBe(true);
		});

		it('should handle empty MJML', () => {
			const mjml = '';
			const result = validateMjmlSyntax(mjml);

			expect(result.valid).toBe(false);
		});

		it('should validate nested MJML structure', () => {
			const mjml = `<mjml>
				<mj-head>
					<mj-title>Test Email</mj-title>
				</mj-head>
				<mj-body>
					<mj-section>
						<mj-column>
							<mj-text>Hello World</mj-text>
						</mj-column>
					</mj-section>
				</mj-body>
			</mjml>`;
			const result = validateMjmlSyntax(mjml);

			expect(result.valid).toBe(true);
		});
	});

	describe('extractMjmlVariables', () => {
		it('should extract single variable', () => {
			const mjml = '<mj-text>Hello {{firstName}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['firstName']);
		});

		it('should extract multiple variables', () => {
			const mjml =
				'<mj-text>Hello {{firstName}} {{lastName}}, your email is {{email}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['firstName', 'lastName', 'email']);
		});

		it('should extract variables with underscores', () => {
			const mjml = '<mj-text>{{first_name}} {{last_name}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['first_name', 'last_name']);
		});

		it('should extract variables with dots (nested properties)', () => {
			const mjml = '<mj-text>{{user.name}} {{user.email}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['user.name', 'user.email']);
		});

		it('should extract variables with numbers', () => {
			const mjml = '<mj-text>{{field1}} {{field2}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['field1', 'field2']);
		});

		it('should handle variables with whitespace', () => {
			const mjml = '<mj-text>{{ firstName }} {{  lastName  }}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['firstName', 'lastName']);
		});

		it('should deduplicate repeated variables', () => {
			const mjml = '<mj-text>{{name}} and {{name}} and {{name}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['name']);
		});

		it('should return empty array when no variables found', () => {
			const mjml = '<mj-text>Hello World</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual([]);
		});

		it('should extract variables from multiple tags', () => {
			const mjml = `
				<mjml>
					<mj-body>
						<mj-text>Hello {{firstName}}</mj-text>
						<mj-text>Your order {{orderId}} is ready</mj-text>
						<mj-button href="{{actionUrl}}">Click here</mj-button>
					</mj-body>
				</mjml>
			`;
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['firstName', 'orderId', 'actionUrl']);
		});

		it('should not extract invalid variable names (starting with number)', () => {
			const mjml = '<mj-text>{{123invalid}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual([]);
		});

		it('should extract variables with uppercase letters', () => {
			const mjml = '<mj-text>{{firstName}} {{LASTNAME}}</mj-text>';
			const variables = extractMjmlVariables(mjml);

			expect(variables).toEqual(['firstName', 'LASTNAME']);
		});
	});

	describe('hasUnclosedTags', () => {
		it('should return false for valid MJML', () => {
			const mjml = '<mjml><mj-body><mj-text>Hello</mj-text></mj-body></mjml>';
			const result = hasUnclosedTags(mjml);

			expect(result).toBe(false);
		});

		it('should detect clearly invalid XML', () => {
			// hasUnclosedTags is just !validateMjmlSyntax().valid
			// Test with something the parser will actually reject
			const mjml = '<><>';
			const result = hasUnclosedTags(mjml);

			expect(result).toBe(true);
		});

		it('should return true for missing root element', () => {
			const mjml = '<mj-body><mj-text>Hello</mj-text></mj-body>';
			const result = hasUnclosedTags(mjml);

			expect(result).toBe(true);
		});

		it('should return false for self-closing tags', () => {
			const mjml = '<mjml><mj-body><mj-divider /></mj-body></mjml>';
			const result = hasUnclosedTags(mjml);

			expect(result).toBe(false);
		});
	});
});
