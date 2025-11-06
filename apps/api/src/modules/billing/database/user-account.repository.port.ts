import type { UserAccount } from '@requil/db';
import type { PlanName } from '@requil/types';

export interface IUserAccountRepository {
	findByUserId(userId: string): Promise<UserAccount | undefined>;
	exists(userId: string): Promise<boolean>;
	create(userId: string, planName: PlanName): Promise<UserAccount>;
	updatePlan(userId: string, planName: PlanName): Promise<void>;
}
