import { pgEnum } from 'drizzle-orm/pg-core';

export const apiScope = pgEnum('api_scope', [
	'send',
	'templates:read',
	'templates:write',
	'subscribers:read',
	'subscribers:write',
	'keys:manage',
	'transports:manage',
	'usage:read',
	'webhooks:manage',
]);

export const assetStatus = pgEnum('asset_status', [
	'uploading',
	'ready',
	'error',
]);
export const assetType = pgEnum('asset_type', ['image', 'font']);
export const eventType = pgEnum('event_type', ['sent', 'delivered', 'bounced']);
export const plan = pgEnum('plan', ['free']);
export const recipientStatus = pgEnum('recipient_status', [
	'pending',
	'sent',
	'delivered',
	'bounced',
	'failed',
	'suppressed',
]);
export const sendJobStatus = pgEnum('send_job_status', [
	'pending',
	'processing',
	'completed',
	'failed',
]);
export const subscriberStatus = pgEnum('subscriber_status', [
	'pending',
	'active',
	'unsubscribed',
	'bounced',
	'complaint',
]);
export const suppressionReason = pgEnum('suppression_reason', [
	'unsubscribed',
	'hard_bounce',
	'complaint',
	'manual',
]);
export const transportState = pgEnum('transport_state', [
	'active',
	'inactive',
	'unverified',
]);
export const transportType = pgEnum('transport_type', ['resend', 'smtp']);
