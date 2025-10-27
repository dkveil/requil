import { createHmac, randomBytes } from 'node:crypto';
import type {
	SignWebhookOptions,
	VerifyWebhookOptions,
	WebhookEventPayload,
	WebhookSignature,
	WebhookVerificationResult,
} from '../types/index';

const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000;

export const generateNonce = (): string => {
	return randomBytes(16).toString('hex');
};

export const createWebhookSignature = (
	payload: string,
	timestamp: number,
	nonce: string,
	secret: string
): string => {
	const signedPayload = `${timestamp}.${nonce}.${payload}`;
	return createHmac('sha256', secret).update(signedPayload).digest('hex');
};

export const signWebhook = (options: SignWebhookOptions): WebhookSignature => {
	const timestamp = options.timestamp ?? Date.now();
	const nonce = options.nonce ?? generateNonce();
	const payloadString =
		typeof options.payload === 'string'
			? options.payload
			: JSON.stringify(options.payload);

	const signature = createWebhookSignature(
		payloadString,
		timestamp,
		nonce,
		options.secret
	);

	return {
		signature,
		timestamp,
		nonce,
	};
};

export const verifyWebhookSignature = (
	options: VerifyWebhookOptions
): WebhookVerificationResult => {
	const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
	const payloadString =
		typeof options.payload === 'string'
			? options.payload
			: JSON.stringify(options.payload);

	const expectedSignature = createWebhookSignature(
		payloadString,
		options.timestamp,
		options.nonce,
		options.secret
	);

	if (options.signature !== expectedSignature) {
		return {
			valid: false,
			reason: 'Invalid signature',
		};
	}

	const age = Date.now() - options.timestamp;
	if (age > maxAgeMs) {
		return {
			valid: false,
			reason: `Timestamp too old (age: ${age}ms, max: ${maxAgeMs}ms)`,
		};
	}

	if (age < 0) {
		return {
			valid: false,
			reason: 'Timestamp is in the future',
		};
	}

	let payload: WebhookEventPayload;
	try {
		payload =
			typeof options.payload === 'string'
				? JSON.parse(options.payload)
				: options.payload;
	} catch {
		return {
			valid: false,
			reason: 'Invalid JSON payload',
		};
	}

	return {
		valid: true,
		payload,
	};
};

export const timingSafeCompare = (a: string, b: string): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	const bufferA = Buffer.from(a);
	const bufferB = Buffer.from(b);

	return bufferA.equals(bufferB);
};
