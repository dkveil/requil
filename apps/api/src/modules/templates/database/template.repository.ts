import { type Template, templates } from '@requil/db';
import { and, eq, sql } from 'drizzle-orm';
import { TemplateEntity } from '../domain/template.domain';
import type { TemplateId, WorkspaceId } from '../domain/templates.types';
import type { ITemplateRepository } from './template.repository.port';

export default function templateRepository({
	db,
	logger,
	repositoryBase,
}: Dependencies): ITemplateRepository {
	const baseRepository = repositoryBase<TemplateEntity, Template>({
		table: templates,
		mapper: {
			toPersistence: (entity: TemplateEntity) => entity.toPersistence(),
			toDomain: (model: Template) => TemplateEntity.fromPersistence(model),
		},
	});

	const findByWorkspaceId = async (
		workspaceId: WorkspaceId
	): Promise<TemplateEntity[]> => {
		const results = await db
			.select()
			.from(templates)
			.where(eq(templates.workspaceId, workspaceId))
			.orderBy(templates.createdAt);

		return results.map((row) => TemplateEntity.fromPersistence(row));
	};

	const existsByStableId = async (
		workspaceId: WorkspaceId,
		stableId: string
	): Promise<boolean> => {
		const result = await db
			.select({ exists: sql<boolean>`1` })
			.from(templates)
			.where(
				and(
					eq(templates.workspaceId, workspaceId),
					eq(templates.stableId, stableId)
				)
			)
			.limit(1);

		return result.length > 0;
	};

	const findByStableId = async (
		workspaceId: WorkspaceId,
		stableId: string
	): Promise<TemplateEntity | undefined> => {
		const result = await db
			.select()
			.from(templates)
			.where(
				and(
					eq(templates.workspaceId, workspaceId),
					eq(templates.stableId, stableId)
				)
			)
			.limit(1);

		if (result.length === 0) return undefined;

		return result[0] ? TemplateEntity.fromPersistence(result[0]) : undefined;
	};

	const findByIdWithWorkspaceCheck = async (
		id: TemplateId,
		workspaceId: WorkspaceId
	): Promise<TemplateEntity | undefined> => {
		const result = await db
			.select()
			.from(templates)
			.where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)))
			.limit(1);

		if (result.length === 0) return undefined;

		return result[0] ? TemplateEntity.fromPersistence(result[0]) : undefined;
	};

	return {
		...baseRepository,
		findByWorkspaceId,
		existsByStableId,
		findByStableId,
		findByIdWithWorkspaceCheck,
	};
}
