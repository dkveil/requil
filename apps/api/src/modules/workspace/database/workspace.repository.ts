import {
	type Workspace,
	WorkspaceMember,
	workspaceMembers,
	workspaces,
} from '@requil/db';
import { and, eq, sql } from 'drizzle-orm';
import { WorkspaceEntity } from '../domain/workspace.domain';
import type {
	UserId,
	WorkspaceId,
	WorkspaceWithRole,
} from '../domain/workspace.type';
import type { IWorkspaceRepository } from './workspace.repository.port';

export default function workspaceRepository({
	db,
	logger,
	repositoryBase,
}: Dependencies): IWorkspaceRepository {
	const baseRepository = repositoryBase<WorkspaceEntity, Workspace>({
		table: workspaces,
		mapper: {
			toPersistence: (entity: WorkspaceEntity) => entity.toPersistence(),
			toDomain: (model: Workspace) => WorkspaceEntity.fromPersistence(model),
		},
	});

	const findByUserId = async (
		userId: UserId
	): Promise<WorkspaceWithRole[] | undefined> => {
		const results = await db
			.select({
				id: workspaces.id,
				name: workspaces.name,
				slug: workspaces.slug,
				createdBy: workspaces.createdBy,
				createdAt: workspaces.createdAt,
				role: workspaceMembers.role,
				memberSince: workspaceMembers.acceptedAt,
			})
			.from(workspaces)
			.innerJoin(
				workspaceMembers,
				eq(workspaces.id, workspaceMembers.workspaceId)
			)
			.where(eq(workspaceMembers.userId, userId));

		return results.map((row) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			createdBy: row.createdBy || '',
			createdAt: row.createdAt,
			role: row.role,
			memberSince: row.memberSince || row.createdAt,
		}));
	};

	const findByIdWithRole = async (
		workspaceId: WorkspaceId,
		userId: UserId
	): Promise<WorkspaceWithRole | undefined> => {
		const result = await db
			.select({
				id: workspaces.id,
				name: workspaces.name,
				slug: workspaces.slug,
				createdBy: workspaces.createdBy,
				createdAt: workspaces.createdAt,
				role: workspaceMembers.role,
				memberSince: workspaceMembers.acceptedAt,
			})
			.from(workspaces)
			.innerJoin(
				workspaceMembers,
				eq(workspaces.id, workspaceMembers.workspaceId)
			)
			.where(
				and(eq(workspaces.id, workspaceId), eq(workspaceMembers.userId, userId))
			)
			.limit(1);

		if (result.length === 0) return undefined;

		const row = result[0];

		if (!row) return undefined;

		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
			createdBy: row.createdBy || '',
			createdAt: row.createdAt,
			role: row.role,
			memberSince: row.memberSince || row.createdAt,
		};
	};

	const existsByName = async (name: string): Promise<boolean> => {
		const result = await db
			.select({ exists: sql<boolean>`1` })
			.from(workspaces)
			.where(eq(workspaces.name, name))
			.limit(1);

		return result.length > 0;
	};

	const existsBySlug = async (slug: string): Promise<boolean> => {
		const result = await db
			.select({ exists: sql<boolean>`1` })
			.from(workspaces)
			.where(eq(workspaces.slug, slug))
			.limit(1);

		return result.length > 0;
	};

	const findPersonalByUserId = async (
		userId: UserId
	): Promise<WorkspaceEntity | undefined> => {
		const result = await db
			.select()
			.from(workspaces)
			.innerJoin(
				workspaceMembers,
				eq(workspaces.id, workspaceMembers.workspaceId)
			)
			.where(eq(workspaceMembers.userId, userId))
			.limit(1);

		if (result.length === 0 || !result[0]) return undefined;

		return WorkspaceEntity.fromPersistence(result[0].workspaces);
	};

	const createWithMember = async (
		workspace: WorkspaceEntity,
		userId: UserId,
		role: WorkspaceMember['role']
	): Promise<WorkspaceWithRole> => {
		const workspaceData = workspace.toPersistence();
		const now = new Date().toISOString();

		await db.transaction(async (tx) => {
			await tx.insert(workspaces).values(workspaceData);

			await tx.insert(workspaceMembers).values({
				workspaceId: workspace.id,
				userId: userId,
				role: role,
				invitedAt: new Date().toISOString(),
				acceptedAt: new Date().toISOString(),
			});
		});

		logger.info(
			{ workspaceId: workspace.id, userId, role },
			'Created workspace with member'
		);

		return {
			id: workspace.id,
			name: workspace.name,
			slug: workspace.slug,
			createdBy: workspace.createdBy,
			createdAt: workspace.createdAt,
			role: role,
			memberSince: now,
		};
	};

	return {
		...baseRepository,
		findByUserId,
		findByIdWithRole,
		existsByName,
		existsBySlug,
		findPersonalByUserId,
		createWithMember,
	};
}
