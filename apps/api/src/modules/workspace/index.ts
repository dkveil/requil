import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { IWorkspaceRepository } from './database/workspace.repository.port';

declare global {
	export interface Dependencies {
		workspaceRepository: IWorkspaceRepository;
	}
}

export const workspaceActionCreator = actionCreatorFactory('workspace');
