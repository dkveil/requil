import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { IUserAccountRepository } from './database/user-account.repository.port';

declare global {
	export interface Dependencies {
		userAccountRepository: IUserAccountRepository;
	}
}

export const billingActionCreator = actionCreatorFactory('billing');
