import type {
	GetTemplateQuery,
	TemplateResponse,
} from '@requil/types/templates';
import type { Action } from '@/shared/cqrs/bus.types';
import { templatesActionCreator } from '../..';
import { TemplateNotFoundError } from '../../domain/template.error';

export const getTemplateAction =
	templatesActionCreator<GetTemplateQuery>('GET_TEMPLATE');

export default function getTemplateHandler({
	queryBus,
	templateRepository,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<GetTemplateQuery>
	): Promise<TemplateResponse> => {
		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		const { id } = action.payload;

		const template = await templateRepository.findOneById(id);

		if (!template) {
			throw new TemplateNotFoundError('Template not found', { id });
		}

		const workspace = await workspaceRepository.findByIdWithRole(
			template.workspaceId,
			userId
		);

		if (!workspace) {
			throw new TemplateNotFoundError('Access denied', { id });
		}

		return template.toResponse();
	};

	const init = async () => {
		queryBus.register(getTemplateAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
