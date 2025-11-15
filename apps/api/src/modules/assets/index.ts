import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { IAssetRepository } from './database/asset.repository.port';

declare global {
	export interface Dependencies {
		assetRepository: IAssetRepository;
	}
}

export const assetsActionCreator = actionCreatorFactory('assets');
