import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '../constants.js';

describe('constants', () => {
	it('should have HTML_MAX_SIZE_BYTES defined', () => {
		expect(CONSTANTS.HTML_MAX_SIZE_BYTES).toBe(150 * 1024);
	});

	it('should have IDEMPOTENCY_KEY_TTL_MS defined', () => {
		expect(CONSTANTS.IDEMPOTENCY_KEY_TTL_MS).toBe(24 * 60 * 60 * 1000);
	});

	it('should have REDIS_KEY_PREFIX defined', () => {
		expect(CONSTANTS.REDIS_KEY_PREFIX.LOCK_SEND).toBe('lock:send:');
		expect(CONSTANTS.REDIS_KEY_PREFIX.RESULT_SEND).toBe('result:send:');
		expect(CONSTANTS.REDIS_KEY_PREFIX.CACHE_MJML).toBe('cache:mjml:');
		expect(CONSTANTS.REDIS_KEY_PREFIX.RATE_LIMIT).toBe('rate:');
	});

	it('should have RATE_LIMIT config', () => {
		expect(CONSTANTS.RATE_LIMIT.STARTER_RPS).toBe(5);
		expect(CONSTANTS.RATE_LIMIT.PRO_RPS).toBe(20);
		expect(CONSTANTS.RATE_LIMIT.BURST_MULTIPLIER).toBe(2);
	});

	it('should have RETRY config', () => {
		expect(CONSTANTS.RETRY.MAX_ATTEMPTS).toBe(5);
		expect(CONSTANTS.RETRY.INITIAL_BACKOFF_MS).toBe(1000);
		expect(CONSTANTS.RETRY.MAX_BACKOFF_MS).toBe(15 * 60 * 1000);
		expect(CONSTANTS.RETRY.BACKOFF_MULTIPLIER).toBe(2);
	});

	it('should have BATCH config', () => {
		expect(CONSTANTS.BATCH.DEFAULT_SIZE).toBe(500);
		expect(CONSTANTS.BATCH.MAX_SIZE).toBe(1000);
	});

	it('should have WEBHOOK config', () => {
		expect(CONSTANTS.WEBHOOK.SIGNATURE_HEADER).toBe('X-Requil-Signature');
		expect(CONSTANTS.WEBHOOK.TIMESTAMP_HEADER).toBe('X-Requil-Timestamp');
		expect(CONSTANTS.WEBHOOK.MAX_AGE_MS).toBe(5 * 60 * 1000);
	});

	it('should have API_KEY config', () => {
		expect(CONSTANTS.API_KEY.PREFIX).toBe('rql');
		expect(CONSTANTS.API_KEY.MIN_LENGTH).toBe(32);
	});
});
