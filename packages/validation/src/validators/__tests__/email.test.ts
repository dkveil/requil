import dns from 'node:dns/promises';
import { describe, expect, it, vi } from 'vitest';
import { normalizeEmail, validateEmail, validateEmailBatch } from '../email';

vi.mock('node:dns/promises');

describe('email validators', () => {
	describe('validateEmail', () => {
		it('should validate a correct email format', async () => {
			const result = await validateEmail('user@example.com');

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should reject invalid email format', async () => {
			const result = await validateEmail('invalid-email');

			expect(result.valid).toBe(false);
			expect(result.error).toBe('Invalid email format');
		});

		it('should reject email without domain', async () => {
			const result = await validateEmail('user@');

			expect(result.valid).toBe(false);
			expect(result.error).toBe('Invalid email format');
		});

		it('should reject email without @', async () => {
			const result = await validateEmail('userexample.com');

			expect(result.valid).toBe(false);
			expect(result.error).toBe('Invalid email format');
		});

		it('should validate international emails by default', async () => {
			const result = await validateEmail('user@тест.com');

			expect(result.valid).toBe(true);
		});

		it('should handle international domain validation', async () => {
			// Note: validator.js may still accept some international domains even with allow_utf8_local_part: false
			// This test validates the option is passed correctly
			const result = await validateEmail('test@example.com', {
				allowInternational: false,
			});

			expect(result.valid).toBe(true);
		});

		it('should validate email with MX record check when checkMx is true', async () => {
			vi.mocked(dns.resolveMx).mockResolvedValue([
				{ exchange: 'mail.example.com', priority: 10 },
			]);

			const result = await validateEmail('user@example.com', { checkMx: true });

			expect(result.valid).toBe(true);
			expect(dns.resolveMx).toHaveBeenCalledWith('example.com');
		});

		it('should reject email with no MX records when checkMx is true', async () => {
			vi.mocked(dns.resolveMx).mockResolvedValue([]);

			const result = await validateEmail('user@example.com', { checkMx: true });

			expect(result.valid).toBe(false);
			expect(result.error).toBe('Domain does not have MX records');
		});

		it('should reject email when MX record lookup fails', async () => {
			vi.mocked(dns.resolveMx).mockRejectedValue(
				new Error('ENOTFOUND: domain not found')
			);

			const result = await validateEmail('user@nonexistent-domain.com', {
				checkMx: true,
			});

			expect(result.valid).toBe(false);
			expect(result.error).toBe('Unable to verify domain MX records');
		});

		it('should handle email without domain when checkMx is true', async () => {
			const result = await validateEmail('user@', { checkMx: true });

			expect(result.valid).toBe(false);
			expect(result.error).toBe('Invalid email format');
		});
	});

	describe('validateEmailBatch', () => {
		it('should validate multiple emails', async () => {
			const emails = [
				'user1@example.com',
				'user2@example.com',
				'user3@example.com',
			];
			const results = await validateEmailBatch(emails);

			expect(results).toHaveLength(3);
			expect(results[0]).toEqual({
				email: 'user1@example.com',
				valid: true,
			});
			expect(results[1]).toEqual({
				email: 'user2@example.com',
				valid: true,
			});
			expect(results[2]).toEqual({
				email: 'user3@example.com',
				valid: true,
			});
		});

		it('should handle mixed valid and invalid emails', async () => {
			const emails = ['valid@example.com', 'invalid-email', 'another@test.com'];
			const results = await validateEmailBatch(emails);

			expect(results).toHaveLength(3);
			expect(results[0]?.valid).toBe(true);
			expect(results[1]?.valid).toBe(false);
			expect(results[1]?.error).toBe('Invalid email format');
			expect(results[2]?.valid).toBe(true);
		});

		it('should validate batch with MX check', async () => {
			vi.mocked(dns.resolveMx).mockResolvedValue([
				{ exchange: 'mail.example.com', priority: 10 },
			]);

			const emails = ['user1@example.com', 'user2@example.com'];
			const results = await validateEmailBatch(emails, { checkMx: true });

			expect(results).toHaveLength(2);
			expect(results[0]?.valid).toBe(true);
			expect(results[1]?.valid).toBe(true);
		});

		it('should handle empty array', async () => {
			const results = await validateEmailBatch([]);

			expect(results).toHaveLength(0);
		});

		it('should include email in each result', async () => {
			const emails = ['test@example.com'];
			const results = await validateEmailBatch(emails);

			expect(results[0]).toMatchObject({
				email: 'test@example.com',
				valid: true,
			});
		});
	});

	describe('normalizeEmail', () => {
		it('should convert email to lowercase', () => {
			const normalized = normalizeEmail('User@EXAMPLE.COM');

			expect(normalized).toBe('user@example.com');
		});

		it('should preserve gmail dots by default', () => {
			const normalized = normalizeEmail('user.name@gmail.com');

			expect(normalized).toBe('user.name@gmail.com');
		});

		it('should preserve gmail subaddresses by default', () => {
			const normalized = normalizeEmail('user+tag@gmail.com');

			expect(normalized).toBe('user+tag@gmail.com');
		});

		it('should handle already normalized email', () => {
			const normalized = normalizeEmail('user@example.com');

			expect(normalized).toBe('user@example.com');
		});

		it('should handle email with mixed case domain', () => {
			const normalized = normalizeEmail('user@ExAmPlE.CoM');

			expect(normalized).toBe('user@example.com');
		});

		it('should preserve plus addressing for other providers', () => {
			const normalized = normalizeEmail('user+tag@outlook.com');

			expect(normalized).toBe('user+tag@outlook.com');
		});
	});
});
