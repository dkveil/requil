import type {
	UpdateWorkspaceInput,
	UpdateWorkspaceResponse,
} from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { WorkspaceEntity } from '../../domain/workspace.domain';
import {
	WorkspaceAuthorizationError,
	WorkspaceConflictError,
	WorkspaceNotFoundError,
} from '../../domain/workspace.error';
import { workspaceActionCreator } from '../../index';

export const updateWorkspaceAction =
	workspaceActionCreator<UpdateWorkspaceInput>('UPDATE_WORKSPACE');

export default function updateWorkspaceHandler({
	commandBus,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<UpdateWorkspaceInput>
	): Promise<UpdateWorkspaceResponse> => {
		const startTime = Date.now();
		logger.info({ payload: action.payload }, 'Updating workspace');

		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		const workspace = await workspaceRepository.findPersonalByUserId(userId);

		if (!workspace) {
			throw new WorkspaceNotFoundError(
				'Workspace not found or you do not have owner access',
				{ userId }
			);
		}

		const workspaceWithRole = await workspaceRepository.findByIdWithRole(
			workspace.id,
			userId
		);

		if (!workspaceWithRole || workspaceWithRole.role !== 'owner') {
			throw new WorkspaceAuthorizationError(
				'Owner role required to update workspace',
				{ workspaceId: workspace.id, userRole: workspaceWithRole?.role }
			);
		}

		if (action.payload.slug && action.payload.slug !== workspace.slug) {
			const slugExists = await workspaceRepository.existsBySlug(
				action.payload.slug
			);

			if (slugExists) {
				throw new WorkspaceConflictError('Workspace slug already exists', {
					slug: action.payload.slug,
				});
			}
		}

		if (action.payload.name !== undefined) {
			workspace.updateName(action.payload.name);
		}

		if (action.payload.slug !== undefined) {
			workspace.updateSlug(action.payload.slug);
		}

		const updatedWorkspace = await workspaceRepository.update(
			workspace.id,
			action.payload
		);

		const duration = Date.now() - startTime;

		logger.info(
			{
				workspaceId: updatedWorkspace.id,
				userId,
				changes: action.payload,
				duration,
			},
			'Workspace updated successfully'
		);

		return {
			id: updatedWorkspace.id,
			name: updatedWorkspace.name,
			slug: updatedWorkspace.slug,
			createdBy: updatedWorkspace.createdBy || userId,
			createdAt: updatedWorkspace.createdAt,
		};
	};

	const init = async () => {
		commandBus.register(updateWorkspaceAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
