import { z } from 'zod';

const emailSchema = z
	.string()
	.email({ message: 'Invalid email address format' });

export const attachmentSchema = z.object({
	filename: z.string().min(1, 'Filename is required'),
	content: z.string().min(1, 'Content is required'),
	contentType: z.string().optional(),
	disposition: z
		.enum(['attachment', 'inline'])
		.optional()
		.default('attachment'),
});

export const recipientSchema = z.union([
	emailSchema,
	z.object({
		email: emailSchema,
		name: z.string().optional(),
		variables: z.record(z.string(), z.unknown()).optional(),
	}),
]);

export const fromSchema = z.union([
	emailSchema,
	z.object({
		email: emailSchema,
		name: z.string().optional(),
	}),
]);

export const replyToSchema = fromSchema;

export const headersSchema = z.record(z.string(), z.string());

export const templateRefSchema = z
	.object({
		stableId: z.string().optional(),
		snapshotId: z.uuid().optional(),
		variables: z.record(z.string(), z.unknown()).optional(),
	})
	.refine((data) => data.stableId || data.snapshotId, {
		message: 'Either stableId or snapshotId must be provided',
	});

/**
 * @example Template-based
 * {
 *   "from": "noreply@example.com",
 *   "to": ["user@example.com"],
 *   "template": {
 *     "stableId": "welcome-email",
 *     "variables": { "firstName": "John" }
 *   }
 * }
 *
 * @example Raw HTML
 * {
 *   "from": "noreply@example.com",
 *   "to": ["user@example.com"],
 *   "subject": "Welcome!",
 *   "html": "<h1>Welcome {{firstName}}!</h1>",
 *   "variables": { "firstName": "John" }
 * }
 */
export const sendRequestSchema = z
	.object({
		from: fromSchema,
		to: z
			.array(recipientSchema)
			.min(1, 'At least one recipient is required')
			.max(50, 'Maximum 50 recipients per request'),

		replyTo: replyToSchema.optional(),
		cc: z.array(recipientSchema).max(10, 'Maximum 10 CC recipients').optional(),
		bcc: z
			.array(recipientSchema)
			.max(10, 'Maximum 10 BCC recipients')
			.optional(),

		template: templateRefSchema.optional(),
		subject: z
			.string()
			.min(1)
			.max(998, 'Subject line too long (max 998 chars)')
			.optional(),
		html: z.string().min(1, 'HTML content is required').optional(),
		plaintext: z.string().optional(),
		variables: z.record(z.string(), z.unknown()).optional(),

		attachments: z
			.array(attachmentSchema)
			.max(10, 'Maximum 10 attachments')
			.optional(),
		headers: headersSchema.optional(),
		transportId: z.uuid().optional(),
		tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
		metadata: z.record(z.string(), z.string()).optional(),

		idempotencyKey: z
			.string()
			.min(1)
			.max(255)
			.regex(
				/^[a-zA-Z0-9_-]+$/,
				'Idempotency key must contain only alphanumeric characters, hyphens, and underscores'
			)
			.optional(),

		scheduledAt: z.string().datetime().optional(),
	})
	.refine(
		(data) => {
			const hasTemplate = !!data.template;
			const hasRawHtml = !!(data.subject && data.html);
			return hasTemplate || hasRawHtml;
		},
		{
			message:
				'Either template (with stableId/snapshotId) or both subject and html must be provided',
			path: ['template'],
		}
	)
	.refine(
		(data) => {
			if (data.template && data.subject) {
				return false;
			}
			return true;
		},
		{
			message:
				'When using template, do not provide subject (it is defined in the template)',
			path: ['subject'],
		}
	);

/**
 * @example
 * {
 *   "from": "noreply@example.com",
 *   "template": { "stableId": "welcome-email" },
 *   "recipients": [
 *     { "email": "user1@example.com", "variables": { "firstName": "John" } },
 *     { "email": "user2@example.com", "variables": { "firstName": "Jane" } }
 *   ]
 * }
 */
export const sendBatchRequestSchema = z.object({
	from: fromSchema,
	replyTo: replyToSchema.optional(),
	template: templateRefSchema,

	recipients: z
		.array(
			z.object({
				email: emailSchema,
				name: z.string().optional(),
				variables: z.record(z.string(), z.unknown()).optional(),
			})
		)
		.min(1, 'At least one recipient is required')
		.max(1000, 'Maximum 1000 recipients per batch'),

	attachments: z.array(attachmentSchema).max(10).optional(),
	headers: headersSchema.optional(),
	transportId: z.uuid().optional(),
	tags: z.array(z.string()).max(10).optional(),
	metadata: z.record(z.string(), z.string()).optional(),
	idempotencyKey: z.string().min(1).max(255).optional(),
	scheduledAt: z.iso.datetime().optional(),
});

/**
 * @example Single send
 * {
 *   "success": true,
 *   "messageId": "msg_abc123",
 *   "recipients": ["user@example.com"]
 * }
 *
 * @example Batch send
 * {
 *   "success": true,
 *   "jobId": "job_xyz789",
 *   "recipients": 100,
 *   "status": "queued"
 * }
 */
export const sendResponseSchema = z.object({
	success: z.literal(true),
	messageId: z.string().optional(),
	jobId: z.string().optional(),
	recipients: z.union([z.array(z.string()), z.number()]),
	status: z.enum(['sent', 'queued']).optional(),
});

/**
 * @example
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid email address",
 *     "details": [
 *       { "field": "to[0]", "message": "Invalid email format" }
 *     ]
 *   }
 * }
 */
export const sendErrorResponseSchema = z.object({
	success: z.literal(false),
	error: z.object({
		code: z.string(),
		message: z.string(),
		details: z
			.array(z.object({ field: z.string(), message: z.string() }))
			.optional(),
	}),
});

export type SendRequest = z.infer<typeof sendRequestSchema>;
export type SendBatchRequest = z.infer<typeof sendBatchRequestSchema>;
export type SendResponse = z.infer<typeof sendResponseSchema>;
export type SendErrorResponse = z.infer<typeof sendErrorResponseSchema>;
export type Recipient = z.infer<typeof recipientSchema>;
export type FromAddress = z.infer<typeof fromSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type TemplateRef = z.infer<typeof templateRefSchema>;
