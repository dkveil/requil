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

export const eventType = pgEnum('event_type', ['sent', 'delivered', 'bounced']);
export const plan = pgEnum('plan', ['starter', 'pro']);
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

export const builderElementType = pgEnum('builder_element_type', [
	'layout',
	'content',
	'media',
	'advanced',
]);

export const builderLayoutElement = pgEnum('builder_layout_element', [
	'container',
	'section',
	'column',
	'columns-2',
	'columns-3',
	'row',
]);

export const builderContentElement = pgEnum('builder_content_element', [
	'heading',
	'paragraph',
	'text',
	'button',
	'divider',
	'spacer',
]);

export const builderMediaElement = pgEnum('builder_media_element', [
	'image',
	'video',
]);

export const builderAdvancedElement = pgEnum('builder_advanced_element', [
	'social-links',
	'unsubscribe',
	'custom',
]);
