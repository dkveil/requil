import { z } from 'zod';

const transportTypeEnum = z.enum(['resend', 'smtp']);

const resendConfigSchema = z.object({
	apiKey: z.string().min(1, 'Resend API key is required'),
});

const smtpConfigSchema = z.object({
	host: z.string().min(1, 'SMTP host is required'),
	port: z.number().min(1).max(65535),
	secure: z.boolean().optional().default(true),
	username: z.string().min(1, 'SMTP username is required'),
	password: z.string().min(1, 'SMTP password is required'),
});

/**
 * @example Resend
 * {
 *   "name": "Production Resend",
 *   "type": "resend",
 *   "config": {
 *     "apiKey": "re_xxxxxxxxxxxx"
 *   },
 *   "isDefault": true
 * }
 *
 * @example SMTP
 * {
 *   "name": "AWS SES",
 *   "type": "smtp",
 *   "config": {
 *     "host": "email-smtp.us-east-1.amazonaws.com",
 *     "port": 587,
 *     "secure": true,
 *     "username": "AKIAXXXXXXXX",
 *     "password": "secret"
 *   }
 * }
 */
export const createTransportSchema = z
	.object({
		name: z.string().min(1, 'Name is required').max(255),
		type: transportTypeEnum,
		config: z.union([resendConfigSchema, smtpConfigSchema]),
		isDefault: z.boolean().optional().default(false),
		dailyLimit: z.number().min(1).optional(),
	})
	.refine(
		(data) => {
			if (data.type === 'resend') {
				return resendConfigSchema.safeParse(data.config).success;
			}
			if (data.type === 'smtp') {
				return smtpConfigSchema.safeParse(data.config).success;
			}
			return false;
		},
		{
			message: 'Config does not match transport type',
			path: ['config'],
		}
	);

/**
 * @example
 * {
 *   "name": "Production Resend - Updated",
 *   "dailyLimit": 50000
 * }
 */
export const updateTransportSchema = z
	.object({
		name: z.string().min(1).max(255).optional(),
		config: z.union([resendConfigSchema, smtpConfigSchema]).optional(),
		isDefault: z.boolean().optional(),
		dailyLimit: z.number().min(1).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

export const verifyTransportSchema = z.object({
	transportId: z.string().uuid(),
});

export type CreateTransport = z.infer<typeof createTransportSchema>;
export type UpdateTransport = z.infer<typeof updateTransportSchema>;
export type VerifyTransport = z.infer<typeof verifyTransportSchema>;
export type TransportType = z.infer<typeof transportTypeEnum>;
