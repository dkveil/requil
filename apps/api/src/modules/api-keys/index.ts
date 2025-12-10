import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import type { IApiKeyRepository } from './database/api-key.repository.port';

declare global {
	export interface Dependencies {
		apiKeyRepository: IApiKeyRepository;
	}
}

export const apiKeyActionCreator = actionCreatorFactory('api-keys');
