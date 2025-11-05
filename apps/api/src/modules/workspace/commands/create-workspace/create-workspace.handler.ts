import type {
	CreateWorkspaceInput,
	CreateWorkspaceResponse,
} from '@requil/types';
import type { Action } from '@/shared/cqrs/bus.types';
import { WorkspaceEntity } from '../../domain/workspace.domain';
import { WorkspaceConflictError } from '../../domain/workspace.error';
import { workspaceActionCreator } from '../../index';

export const createWorkspaceAction =
	workspaceActionCreator<CreateWorkspaceInput>('CREATE_WORKSPACE');

export default function createWorkspaceHandler({
	commandBus,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<CreateWorkspaceInput>
	): Promise<CreateWorkspaceResponse> => {
		logger.info({ payload: action.payload }, 'Creating workspace');

		// Check if workspace with this name already exists
		const exists = await workspaceRepository.existsByName(action.payload.name);

		if (exists) {
			throw new WorkspaceConflictError(
				'Workspace with this name already exists',
				{
					name: action.payload.name,
				}
			);
		}

		// Get user ID from action metadata
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		// Create workspace entity
		const workspace = WorkspaceEntity.create(action.payload, userId);

		// Save workspace with member
		const result = await workspaceRepository.createWithMember(
			workspace,
			userId,
			'owner'
		);

		logger.info(
			{ workspaceId: result.id, userId },
			'Workspace created successfully'
		);

		return {
			id: result.id,
			name: result.name,
			createdBy: result.createdBy || userId,
			createdAt: result.createdAt,
		};
	};

	const init = async () => {
		commandBus.register(createWorkspaceAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
