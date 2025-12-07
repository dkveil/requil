// import { convertDocumentToHtml } from '@requil/email-engine';

import { renderDocumentToHtml } from '@requil/email-engine';
import type { Document } from '@requil/types';
import {
	UpdateTemplateInput,
	UpdateTemplateParams,
	UpdateTemplateResponse,
} from '@requil/types';
import { Action } from '@/shared/cqrs/bus.types';
import { templatesActionCreator } from '../..';
import { TemplateNotFoundError } from '../../domain/template.error';

export const updateTemplateAction = templatesActionCreator<
	UpdateTemplateInput & UpdateTemplateParams
>('UPDATE_TEMPLATE');

export default function updateTemplateHandler({
	commandBus,
	templateRepository,
	workspaceRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<UpdateTemplateInput & UpdateTemplateParams>
	): Promise<UpdateTemplateResponse> => {
		logger.info({ payload: action.payload }, 'Updating template');

		const userId = action.meta?.userId as string;

		if (!userId) {
			throw new Error('User ID is required');
		}

		const { id, ...updateData } = action.payload;

		const existing = await templateRepository.findOneById(id);

		if (!existing) {
			throw new TemplateNotFoundError('Template not found', { id });
		}

		const workspace = await workspaceRepository.findByIdWithRole(
			existing.workspaceId,
			userId
		);

		if (!workspace) {
			throw new TemplateNotFoundError('Access denied', { id });
		}

		let html: string | undefined;

		if (updateData.document) {
			const document = updateData.document as unknown as Document;
			const htmlResult = await renderDocumentToHtml(document);
			if (htmlResult.errors.length > 0) {
				logger.warn(
					{ errors: htmlResult.errors, templateId: id },
					'HTML conversion had errors'
				);
			}
			html = htmlResult.html;
		}

		const result = await templateRepository.updateTemplate(
			id,
			existing.workspaceId,
			{
				...updateData,
				html,
			}
		);

		if (!result) {
			throw new TemplateNotFoundError('Failed to update template', {
				templateId: id,
			});
		}

		logger.info(
			{ templateId: result.id, workspaceId: result.workspaceId, userId },
			'Template updated successfully'
		);

		return {
			id: result.id,
			workspaceId: result.workspaceId,
			stableId: result.stableId,
			name: result.name,
			description: result.description ?? null,
			updatedAt: result.updatedAt,
		};
	};

	const init = async () => {
		commandBus.register(updateTemplateAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
