import { CreateTemplateInput, CreateTemplateResponse } from '@requil/types';
import { Action } from '@/shared/cqrs/bus.types';
import { templatesActionCreator } from '../..';
import { TemplateEntity } from '../../domain/template.domain';
import { TemplateConflictError } from '../../domain/template.error';

export const createTemplateAction =
	templatesActionCreator<CreateTemplateInput>('CREATE_TEMPLATE');

export default function createTemplateHandler({
	commandBus,
	templateRepository,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<CreateTemplateInput>
	): Promise<CreateTemplateResponse> => {
		logger.info({ payload: action.payload }, 'Creating template');

		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		const { workspaceId, stableId } = action.payload;

		const workspace = await workspaceRepository.findByIdWithRole(
			workspaceId,
			userId
		);

		if (!workspace) {
			throw new TemplateConflictError('Workspace not found or access denied', {
				workspaceId,
			});
		}

		const stableIdExists = await templateRepository.existsByStableId(
			workspaceId,
			stableId
		);

		if (stableIdExists) {
			throw new TemplateConflictError(
				'Template with this stable ID already exists in this workspace',
				{
					workspaceId,
					stableId,
				}
			);
		}

		const template = TemplateEntity.create(action.payload, userId);

		const result = await templateRepository.create(template);

		logger.info(
			{ templateId: template.id, workspaceId, userId },
			'Template created successfully'
		);

		return {
			id: result.id,
			workspaceId: result.workspaceId,
			stableId: result.stableId,
			name: result.name,
			description: result.description ?? null,
			createdBy: result.createdBy ?? '',
			updatedAt: result.updatedAt,
			createdAt: result.createdAt,
		};
	};

	const init = async () => {
		commandBus.register(createTemplateAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
