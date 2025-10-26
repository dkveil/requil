export type WebhookEventType = 'delivered' | 'opened' | 'clicked' | 'bounced';

export type BounceType = 'hard' | 'soft';

export interface WebhookBasePayload {
	eventType: WebhookEventType;
	timestamp: number;
	messageId: string;
	recipient: string;
	templateSnapshotId: string;
	transport: 'resend' | 'smtp';
	workspaceId: string;
	traceId: string;
}

export interface DeliveredEventPayload extends WebhookBasePayload {
	eventType: 'delivered';
}

export interface OpenedEventPayload extends WebhookBasePayload {
	eventType: 'opened';
	userAgent?: string;
	ipAddress?: string;
}

export interface ClickedEventPayload extends WebhookBasePayload {
	eventType: 'clicked';
	url: string;
	userAgent?: string;
	ipAddress?: string;
}

export interface BouncedEventPayload extends WebhookBasePayload {
	eventType: 'bounced';
	bounceType: BounceType;
	reason?: string;
	code?: string;
}

export type WebhookEventPayload =
	| DeliveredEventPayload
	| OpenedEventPayload
	| ClickedEventPayload
	| BouncedEventPayload;

export interface WebhookSignature {
	signature: string;
	timestamp: number;
	nonce: string;
}

export interface WebhookVerificationResult {
	valid: boolean;
	reason?: string;
	payload?: WebhookEventPayload;
}

export interface WebhookConfig {
	url: string;
	secret: string;
	events: WebhookEventType[];
	enabled: boolean;
	retryConfig?: {
		maxRetries: number;
		backoffMs: number;
	};
}

export interface SignWebhookOptions {
	payload: WebhookEventPayload;
	secret: string;
	timestamp?: number;
	nonce?: string;
}

export interface VerifyWebhookOptions {
	payload: string | WebhookEventPayload;
	signature: string;
	secret: string;
	timestamp: number;
	nonce: string;
	maxAgeMs?: number;
}
