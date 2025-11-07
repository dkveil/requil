import type { PlanLimits, PlanName } from './plan-limits.schema';

export const ACCOUNT_PLAN_LIMITS: Record<PlanName, PlanLimits> = {
	free: {
		workspacesMax: 1,
		emailsPerMonth: 80,
		teamMembersTotal: 1,
		apiCallsPerMonth: 200,
		templatesPerWorkspace: 5,
		features: {
			communitySupport: true,
		},
	},
};

export function getPlanLimits(planName: PlanName): PlanLimits {
	return ACCOUNT_PLAN_LIMITS[planName];
}

export function isUnlimited(limit: number): boolean {
	return limit === -1;
}

export function canCreateWorkspace(
	currentWorkspaceCount: number,
	planLimits: PlanLimits
): boolean {
	if (isUnlimited(planLimits.workspacesMax)) return true;
	return currentWorkspaceCount < planLimits.workspacesMax;
}
