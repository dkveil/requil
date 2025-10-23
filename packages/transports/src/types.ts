import type { TraceId } from '@requil/utils/logger';

export type EmailAddress = {
	email: string;
	name?: string;
};

export type EmailAttachment = {
	filename: string;
	content: Buffer | string;
	contentType?: string;
};

export type EmailHeaders = {
	[key: string]: string;
};

export type SendEmailRequest = {
	from: EmailAddress;
	to: EmailAddress[];
	subject: string;
	html: string;
	plaintext?: string;
	replyTo?: EmailAddress;
	headers?: EmailHeaders;
	attachments?: EmailAttachment[];
	tags?: Record<string, string>;
	traceId?: TraceId;
};

export type SendEmailResponse = {
	messageId: string;
	accepted: string[];
	rejected?: Array<{ email: string; reason: string }>;
	transportMetadata?: Record<string, unknown>;
};

export type TransportConfig = {
	type: 'resend' | 'smtp';
	traceId?: TraceId;
};

export type ResendConfig = TransportConfig & {
	type: 'resend';
	apiKey: string;
};

export type SmtpConfig = TransportConfig & {
	type: 'smtp';
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
};

export type AnyTransportConfig = ResendConfig | SmtpConfig;
