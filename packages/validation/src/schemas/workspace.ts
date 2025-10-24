import { z } from 'zod';

/**
 * @example
 * {
 *   "name": "Acme Inc",
 *   "slug": "acme-inc"
 * }
 */
export const createWorkspaceSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.max(63)
		.regex(
			/^[a-z0-9-]+$/,
			'Slug must contain only lowercase letters, numbers, and hyphens'
		),
	description: z.string().max(1000).optional(),
});

/**
 * @example
 * {
 *   "name": "Acme Corporation"
 * }
 */
export const updateWorkspaceSchema = z
	.object({
		name: z.string().min(1).max(255).optional(),
		description: z.string().max(1000).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

/**
 * @example
 * {
 *   "email": "member@example.com",
 *   "role": "member"
 * }
 */
export const inviteMemberSchema = z.object({
	email: z.string().email({ message: 'Invalid email address format' }),
	role: z.enum(['owner', 'member']).default('member'),
});

/**
 * @example
 * {
 *   "token": "invitation-token-from-email"
 * }
 */
export const acceptInvitationSchema = z.object({
	token: z.string().min(1),
});

/**
 * @example
 * {
 *   "role": "owner"
 * }
 */
export const updateMemberRoleSchema = z.object({
	role: z.enum(['owner', 'member']),
});

/**
 * @example
 * {
 *   "logo": "https://example.com/logo.png",
 *   "primaryColor": "#FF5733",
 *   "fontFamily": "Inter"
 * }
 */
export const updateBrandkitSchema = z
	.object({
		logo: z.string().url().optional(),
		primaryColor: z
			.string()
			.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
			.optional(),
		secondaryColor: z
			.string()
			.regex(/^#[0-9A-Fa-f]{6}$/)
			.optional(),
		fontFamily: z.string().max(100).optional(),
		customCss: z.string().max(10000).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});

export type CreateWorkspace = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof updateWorkspaceSchema>;
export type InviteMember = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>;
export type UpdateBrandkit = z.infer<typeof updateBrandkitSchema>;
