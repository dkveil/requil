import { z } from 'zod';

export const planNameSchema = z.enum(['free']);

export const planFeaturesSchema = z.object({
	communitySupport: z.boolean(),
});

export const planLimitsSchema = z.object({
	workspacesMax: z.number().int(), // -1 = unlimited
	emailsPerMonth: z.number().int().positive(),
	teamMembersTotal: z.number().int(), // -1 = unlimited
	apiCallsPerMonth: z.number().int().positive(),
	templatesPerWorkspace: z.number().int(), // -1 = unlimited
	// customDomainsTotal: z.number().int().nonnegative(),
	// webhooksTotal: z.number().int().nonnegative(),
	features: planFeaturesSchema,
});

export const accountSchema = z.object({
	userId: z.uuid(),
	plan: planNameSchema,
	limits: planLimitsSchema,
	currentPeriodStart: z.string(),
	currentPeriodEnd: z.string(),
	stripeCustomerId: z.string().nullable().optional(),
	stripeSubscriptionId: z.string().nullable().optional(),
	updatedAt: z.string(),
});

export type PlanLimits = z.infer<typeof planLimitsSchema>;
export type PlanName = z.infer<typeof planNameSchema>;
export type Account = z.infer<typeof accountSchema>;
