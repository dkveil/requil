import type { RepositoryPort } from '@/shared/db/repository.port';
import type { TemplateEntity } from '../domain/template.domain';
import type { TemplateId, WorkspaceId } from '../domain/templates.types';

export interface ITemplateRepository
	extends RepositoryPort<TemplateEntity, TemplateId> {
	findByWorkspaceId(workspaceId: WorkspaceId): Promise<TemplateEntity[]>;
	existsByStableId(
		workspaceId: WorkspaceId,
		stableId: string
	): Promise<boolean>;
	findByStableId(
		workspaceId: WorkspaceId,
		stableId: string
	): Promise<TemplateEntity | undefined>;
	findByIdWithWorkspaceCheck(
		id: TemplateId,
		workspaceId: WorkspaceId
	): Promise<TemplateEntity | undefined>;
}
