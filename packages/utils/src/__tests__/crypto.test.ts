import { describe, expect, it } from 'vitest';
import {
	createHmacSignature,
	generateApiKey,
	generateNonce,
	hashToken,
	verifyApiKeyFormat,
	verifyHmacSignature,
} from '../crypto.js';

const API_KEY_REGEX = /^rql_[A-Za-z0-9_-]{43}$/;

describe('crypto utils', () => {
	describe('generateApiKey', () => {
		it('should generate valid API key with correct format', () => {
			const { key, prefix, hash } = generateApiKey();

			expect(prefix).toBe('rql');
			expect(key).toMatch(API_KEY_REGEX);
			expect(hash).toBeTruthy();
			expect(verifyApiKeyFormat(key)).toBe(true);
		});

		it('should generate unique keys', () => {
			const key1 = generateApiKey();
			const key2 = generateApiKey();

			expect(key1.key).not.toBe(key2.key);
			expect(key1.hash).not.toBe(key2.hash);
		});
	});

	describe('hashToken', () => {
		it('should produce consistent hashes', () => {
			const token = 'test_token';
			const hash1 = hashToken(token);
			const hash2 = hashToken(token);

			expect(hash1).toBe(hash2);
		});

		it('should produce different hashes for different tokens', () => {
			const hash1 = hashToken('token1');
			const hash2 = hashToken('token2');

			expect(hash1).not.toBe(hash2);
		});
	});

	describe('HMAC signature', () => {
		it('should verify valid signature', () => {
			const payload = JSON.stringify({ data: 'test', timestamp: Date.now() });
			const secret = 'my-secret';
			const signature = createHmacSignature(payload, secret);

			expect(verifyHmacSignature(payload, signature, secret)).toBe(true);
		});

		it('should reject invalid signature', () => {
			const payload = JSON.stringify({ data: 'test', timestamp: Date.now() });
			const secret = 'my-secret';
			const wrongSignature = 'wrong-signature';

			expect(verifyHmacSignature(payload, wrongSignature, secret)).toBe(false);
		});

		it('should reject expired signature when maxAge is set', () => {
			const oldTimestamp = Date.now() - 10000;
			const payload = JSON.stringify({ data: 'test', timestamp: oldTimestamp });
			const secret = 'my-secret';
			const signature = createHmacSignature(payload, secret);

			expect(verifyHmacSignature(payload, signature, secret, 5000)).toBe(false);
		});
	});

	describe('generateNonce', () => {
		it('should generate nonce of correct length', () => {
			const nonce = generateNonce();
			expect(nonce).toHaveLength(32);
		});

		it('should generate unique nonces', () => {
			const nonce1 = generateNonce();
			const nonce2 = generateNonce();
			expect(nonce1).not.toBe(nonce2);
		});
	});
});
