import { z } from 'zod';

export const sendEmailRecipientSchema = z.object({
	email: z.string().email('Invalid email address'),
	variables: z.record(z.string(), z.any()).optional(),
});

export const sendEmailSchema = z.object({
	template: z.string().min(1, 'Template identifier is required'),
	to: z
		.array(sendEmailRecipientSchema)
		.min(1, 'At least one recipient is required')
		.max(500, 'Maximum 500 recipients per request'),
});

export const sendEmailResponseSchema = z.object({
	ok: z.boolean(),
	jobId: z.uuid(),
	usedTemplateSnapshotId: z.uuid(),
	sent: z.number().int().nonnegative(),
	failed: z.number().int().nonnegative(),
	warnings: z.array(z.string()),
});

export type SendEmailRecipient = z.infer<typeof sendEmailRecipientSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendEmailResponse = z.infer<typeof sendEmailResponseSchema>;
