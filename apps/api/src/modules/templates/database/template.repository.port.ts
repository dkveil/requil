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
	updateTemplate(
		id: TemplateId,
		workspaceId: WorkspaceId,
		data: Partial<{
			name: string;
			description: string | null;
			builderStructure: Record<string, unknown> | null;
			html: string | null;
			variablesSchema: Record<string, unknown> | null;
			subjectLines: string[] | null;
			preheader: string | null;
		}>
	): Promise<TemplateEntity | undefined>;
}
