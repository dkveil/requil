import { describe, expect, it } from 'vitest';
import {
	createHmacSignature,
	generateApiKey,
	generateNonce,
	hashApiKey,
	hashToken,
	verifyApiKey,
	verifyApiKeyFormat,
	verifyHmacSignature,
} from '../crypto';

const API_KEY_REGEX = /^rql_[A-Za-z0-9_-]{43}$/;
const API_KEY_PREFIX_REGEX = /^rql_[A-Za-z0-9_-]{8}$/;
const ARGON2ID_HASH_REGEX = /^\$argon2id\$/;

describe('crypto utils', () => {
	describe('generateApiKey', () => {
		it('should generate valid API key with correct format', async () => {
			const { key, prefix, hash } = await generateApiKey();

			expect(key).toMatch(API_KEY_REGEX);
			expect(prefix).toHaveLength(12);
			expect(prefix).toMatch(API_KEY_PREFIX_REGEX);
			expect(hash).toBeTruthy();
			expect(verifyApiKeyFormat(key)).toBe(true);
		});

		it('should generate unique keys', async () => {
			const key1 = await generateApiKey();
			const key2 = await generateApiKey();

			expect(key1.key).not.toBe(key2.key);
			expect(key1.hash).not.toBe(key2.hash);
			expect(key1.prefix).not.toBe(key2.prefix);
		});

		it('should generate Argon2id hash', async () => {
			const { hash } = await generateApiKey();

			expect(hash).toMatch(ARGON2ID_HASH_REGEX);
		});
	});

	describe('hashApiKey', () => {
		it('should hash API key with Argon2id', async () => {
			const key = 'rql_test123456789012345678901234567890123';
			const hash = await hashApiKey(key);

			expect(hash).toBeTruthy();
			expect(hash).toMatch(ARGON2ID_HASH_REGEX);
		});

		it('should produce different hashes for different keys', async () => {
			const hash1 = await hashApiKey('rql_key1');
			const hash2 = await hashApiKey('rql_key2');

			expect(hash1).not.toBe(hash2);
		});
	});

	describe('verifyApiKey', () => {
		it('should verify correct API key', async () => {
			const key = 'rql_test123456789012345678901234567890123';
			const hash = await hashApiKey(key);

			const isValid = await verifyApiKey(hash, key);
			expect(isValid).toBe(true);
		});

		it('should reject incorrect API key', async () => {
			const key = 'rql_test123456789012345678901234567890123';
			const wrongKey = 'rql_wrong123456789012345678901234567890';
			const hash = await hashApiKey(key);

			const isValid = await verifyApiKey(hash, wrongKey);
			expect(isValid).toBe(false);
		});

		it('should reject invalid hash format', async () => {
			const key = 'rql_test123456789012345678901234567890123';
			const invalidHash = 'invalid-hash';

			const isValid = await verifyApiKey(invalidHash, key);
			expect(isValid).toBe(false);
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
