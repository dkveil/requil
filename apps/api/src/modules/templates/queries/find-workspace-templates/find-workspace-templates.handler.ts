import type {
	FindWorkspaceTemplatesQuery,
	FindWorkspaceTemplatesResponse,
} from '@requil/types/templates';
import type { Action } from '@/shared/cqrs/bus.types';
import { templatesActionCreator } from '../..';

export const findWorkspaceTemplatesAction =
	templatesActionCreator<FindWorkspaceTemplatesQuery>(
		'FIND_WORKSPACE_TEMPLATES'
	);

export default function findWorkspaceTemplatesHandler({
	queryBus,
	templateRepository,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<FindWorkspaceTemplatesQuery>
	): Promise<FindWorkspaceTemplatesResponse> => {
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		const { workspaceId } = action.payload;

		const workspace = await workspaceRepository.findByIdWithRole(
			workspaceId,
			userId
		);

		if (!workspace) {
			throw new Error('Workspace not found or access denied');
		}

		const templates = await templateRepository.findByWorkspaceId(workspaceId);

		return {
			templates: templates.map((t) => ({
				id: t.id,
				workspaceId: t.workspaceId,
				stableId: t.stableId,
				name: t.name,
				description: t.description,
				createdBy: t.createdBy,
				createdAt: t.createdAt,
				updatedAt: t.updatedAt,
			})),
		};
	};

	const init = async () => {
		queryBus.register(findWorkspaceTemplatesAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
