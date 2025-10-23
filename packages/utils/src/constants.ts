export const CONSTANTS = {
	HTML_MAX_SIZE_BYTES: 150 * 1024,

	IDEMPOTENCY_KEY_TTL_MS: 24 * 60 * 60 * 1000,

	REDIS_KEY_PREFIX: {
		LOCK_SEND: 'lock:send:',
		RESULT_SEND: 'result:send:',
		CACHE_MJML: 'cache:mjml:',
		CACHE_HTML: 'cache:html:',
		CACHE_BRANDKIT: 'cache:brandkit:',
		CACHE_SCHEMA: 'cache:schema:',
		RATE_LIMIT: 'rate:',
	},

	RATE_LIMIT: {
		STARTER_RPS: 5,
		PRO_RPS: 20,
		BURST_MULTIPLIER: 2,
	},

	RETRY: {
		MAX_ATTEMPTS: 5,
		INITIAL_BACKOFF_MS: 1000,
		MAX_BACKOFF_MS: 15 * 60 * 1000,
		BACKOFF_MULTIPLIER: 2,
	},

	BATCH: {
		DEFAULT_SIZE: 500,
		MAX_SIZE: 1000,
	},

	USAGE: {
		ALERT_THRESHOLD: 0.8,
	},

	WEBHOOK: {
		SIGNATURE_HEADER: 'X-Requil-Signature',
		TIMESTAMP_HEADER: 'X-Requil-Timestamp',
		MAX_AGE_MS: 5 * 60 * 1000,
	},

	API_KEY: {
		PREFIX: 'rql',
		MIN_LENGTH: 32,
	},
} as const;

export type Constants = typeof CONSTANTS;
