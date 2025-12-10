import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { ISendingRepository } from './database/sending.repository.port';

declare global {
	export interface Dependencies {
		sendingRepository: ISendingRepository;
	}
}

export const sendingActionCreator = actionCreatorFactory('sending');
