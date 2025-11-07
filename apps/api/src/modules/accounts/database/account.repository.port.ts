import type { Account } from '@requil/db';
import type { PlanName } from '@requil/types';

export interface IAccountRepository {
	findByUserId(userId: string): Promise<Account | undefined>;
	exists(userId: string): Promise<boolean>;
	create(userId: string, planName: PlanName): Promise<Account>;
	updatePlan(userId: string, planName: PlanName): Promise<void>;
}
