import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { IAccountRepository } from './database/account.repository.port';

declare global {
	export interface Dependencies {
		accountRepository: IAccountRepository;
	}
}

export const accountActionCreator = actionCreatorFactory('account');
