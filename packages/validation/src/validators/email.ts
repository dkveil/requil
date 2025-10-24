import dns from 'node:dns/promises';
import validator from 'validator';

export interface EmailValidationResult {
	valid: boolean;
	error?: string;
}

export interface EmailValidationOptions {
	checkMx?: boolean;
	allowInternational?: boolean;
}

/**
 * @example
 * const result = await validateEmail('user@example.com');
 * // { valid: true }
 *
 * @example With MX check
 * const result = await validateEmail('user@fake-domain-xyz.com', { checkMx: true });
 * // { valid: false, error: 'Domain does not have MX records' }
 */
export async function validateEmail(
	email: string,
	options: EmailValidationOptions = {}
): Promise<EmailValidationResult> {
	const { checkMx = false, allowInternational = true } = options;

	if (
		!validator.isEmail(email, { allow_utf8_local_part: allowInternational })
	) {
		return {
			valid: false,
			error: 'Invalid email format',
		};
	}

	if (checkMx) {
		const domain = email.split('@')[1];
		if (!domain) {
			return {
				valid: false,
				error: 'Invalid email format',
			};
		}

		try {
			const mxRecords = await dns.resolveMx(domain);
			if (mxRecords.length === 0) {
				return {
					valid: false,
					error: 'Domain does not have MX records',
				};
			}
		} catch (_error) {
			return {
				valid: false,
				error: 'Unable to verify domain MX records',
			};
		}
	}

	return { valid: true };
}

/**
 * @example
 * const results = await validateEmailBatch(['user1@example.com', 'invalid', 'user2@example.com']);
 * // [
 * //   { email: 'user1@example.com', valid: true },
 * //   { email: 'invalid', valid: false, error: 'Invalid email format' },
 * //   { email: 'user2@example.com', valid: true }
 * // ]
 */
export async function validateEmailBatch(
	emails: string[],
	options: EmailValidationOptions = {}
): Promise<Array<EmailValidationResult & { email: string }>> {
	const results = await Promise.all(
		emails.map((email) => validateEmail(email, options))
	);

	return emails.map((email, index) => {
		const result = results[index];
		if (!result) {
			return { email, valid: false, error: 'Validation failed' };
		}
		return { email, ...result };
	});
}

/**
 * @example
 * const normalized = normalizeEmail('User+tag@EXAMPLE.COM');
 * // 'user@example.com'
 */
export function normalizeEmail(email: string): string {
	return (
		validator.normalizeEmail(email, {
			gmail_remove_dots: false,
			gmail_remove_subaddress: false,
			outlookdotcom_remove_subaddress: false,
			yahoo_remove_subaddress: false,
			icloud_remove_subaddress: false,
		}) || email.toLowerCase()
	);
}
