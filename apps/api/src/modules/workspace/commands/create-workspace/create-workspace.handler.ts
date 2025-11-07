import type {
	CreateWorkspaceInput,
	CreateWorkspaceResponse,
} from '@requil/types';
import { canCreateWorkspace } from '@/modules/accounts/domain/plan-limits.config';
import type { Action } from '@/shared/cqrs/bus.types';
import { WorkspaceEntity } from '../../domain/workspace.domain';
import { WorkspaceConflictError } from '../../domain/workspace.error';
import { workspaceActionCreator } from '../../index';

export const createWorkspaceAction =
	workspaceActionCreator<CreateWorkspaceInput>('CREATE_WORKSPACE');

export default function createWorkspaceHandler({
	commandBus,
	workspaceRepository,
	accountRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<CreateWorkspaceInput>
	): Promise<CreateWorkspaceResponse> => {
		logger.info({ payload: action.payload }, 'Creating workspace');

		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		let account = await accountRepository.findByUserId(userId);

		if (!account) {
			logger.warn(
				{ userId },
				'Account not found, creating lazily (should have been created during registration)'
			);
			account = await accountRepository.create(userId, 'free');
		}

		const existingWorkspaces = await workspaceRepository.findByUserId(userId);
		const workspaceCount = existingWorkspaces?.length || 0;

		if (!canCreateWorkspace(workspaceCount, account.limits)) {
			throw new WorkspaceConflictError(
				`Your ${account.plan} plan allows maximum ${account.limits.workspacesMax} workspace(s). Please upgrade to create more.`,
				{
					currentPlan: account.plan,
					currentCount: workspaceCount,
					maxAllowed: account.limits.workspacesMax,
				}
			);
		}

		const nameExists = await workspaceRepository.existsByName(
			action.payload.name
		);

		if (nameExists) {
			throw new WorkspaceConflictError(
				'Workspace with this name already exists',
				{
					name: action.payload.name,
				}
			);
		}

		const slugExists = await workspaceRepository.existsBySlug(
			action.payload.slug
		);

		if (slugExists) {
			throw new WorkspaceConflictError(
				'Workspace with this slug already exists',
				{
					slug: action.payload.slug,
				}
			);
		}

		const workspace = WorkspaceEntity.create(action.payload, userId);

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
			slug: result.slug,
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
