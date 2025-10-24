import { z } from 'zod';

const jsonSchemaSchema = z.object({
	type: z.enum(['object', 'string', 'number', 'boolean', 'array']),
	properties: z.record(z.any()).optional(),
	required: z.array(z.string()).optional(),
	additionalProperties: z.boolean().optional(),
	default: z.any().optional(),
});
/**
 * @example
 * {
 *   "stableId": "welcome-email",
 *   "name": "Welcome Email",
 *   "description": "Sent to new users after signup",
 *   "mjml": "<mjml>...</mjml>",
 *   "variablesSchema": {
 *     "type": "object",
 *     "properties": {
 *       "firstName": { "type": "string", "default": "Friend" }
 *     }
 *
 *   }
 * }
 */
export const createTemplateSchema = z.object({
	stableId: z
		.string()
		.min(1, 'Stable ID is required')
		.max(255)
		.regex(
			/^[a-z0-9-]+$/,
			'Stable ID must contain only lowercase letters, numbers, and hyphens'
		),
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	mjml: z.string().min(1, 'MJML content is required'),
	variablesSchema: jsonSchemaSchema.optional(),
	subjectLines: z
		.array(z.string().min(1).max(998))
		.min(1, 'At least one subject line is required')
		.max(5),
	preheader: z.string().max(255).optional(),
	tags: z.array(z.string()).max(10).optional(),
});

/**
 * @example
 * {
 *   "name": "Welcome Email - Updated",
 *   "mjml": "<mjml>...</mjml>"
 * }
 */
export const updateTemplateSchema = createTemplateSchema
	.omit({ stableId: true })
	.partial()
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

/**
 * @example
 * {
 *   "mjml": "<mjml>...</mjml>",
 *   "variables": { "firstName": "John" },
 *   "variablesSchema": {
 *     "type": "object",
 *     "properties": {
 *       "firstName": { "type": "string", "default": "Friend" }
 *     }
 *   },
 *   "mode": "strict"
 * }
 */
export const validateTemplateSchema = z.object({
	mjml: z.string().min(1, 'MJML content is required'),
	variables: z.record(z.unknown()).optional(),
	variablesSchema: jsonSchemaSchema.optional(),
	mode: z.enum(['strict', 'permissive']).optional().default('strict'),
	checkGuardrails: z.boolean().optional().default(true),
});

/**
 * @example
 * {
 *   "valid": true,
 *   "errors": [],
 *   "warnings": ["Image missing alt text"],
 *   "guardrails": {
 *     "altText": { "passed": false, "message": "2 images missing alt text" },
 *     "contrast": { "passed": true },
 *     "httpsLinks": { "passed": true },
 *     "size": { "passed": true, "size": 45000, "limit": 102400 }
 *   }
 * }
 */
export const validateTemplateResponseSchema = z.object({
	valid: z.boolean(),
	errors: z.array(
		z.object({
			type: z.enum(['mjml', 'variables', 'guardrails']),
			message: z.string(),
			field: z.string().optional(),
			line: z.number().optional(),
		})
	),
	warnings: z.array(z.string()),
	guardrails: z
		.object({
			altText: z
				.object({ passed: z.boolean(), message: z.string().optional() })
				.optional(),
			contrast: z
				.object({ passed: z.boolean(), message: z.string().optional() })
				.optional(),
			httpsLinks: z
				.object({ passed: z.boolean(), message: z.string().optional() })
				.optional(),
			size: z
				.object({ passed: z.boolean(), size: z.number(), limit: z.number() })
				.optional(),
		})
		.optional(),
});

/**
 * @example
 * {
 *   "publishedBy": "user-uuid",
 *   "notes": "Fixed typo in subject line"
 * }
 */
export const publishTemplateSchema = z.object({
	publishedBy: z.string().uuid(),
	notes: z.string().max(1000).optional(),
});

export const templateQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	search: z.string().optional(),
	tags: z.array(z.string()).optional(),
	sortBy: z
		.enum(['createdAt', 'updatedAt', 'name'])
		.optional()
		.default('updatedAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateTemplate = z.infer<typeof createTemplateSchema>;
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;
export type ValidateTemplate = z.infer<typeof validateTemplateSchema>;
export type ValidateTemplateResponse = z.infer<
	typeof validateTemplateResponseSchema
>;
export type PublishTemplate = z.infer<typeof publishTemplateSchema>;
export type TemplateQuery = z.infer<typeof templateQuerySchema>;
