import { WorkspaceMember } from '@requil/db';
import type { RepositoryPort } from '@/shared/db/repository.port';
import type { WorkspaceEntity } from '../domain/workspace.domain';
import type {
	UpdateWorkspaceProps,
	UserId,
	WorkspaceId,
	WorkspaceWithRole,
} from '../domain/workspace.type';

export interface IWorkspaceRepository
	extends RepositoryPort<WorkspaceEntity, WorkspaceId> {
	findByUserId(userId: UserId): Promise<WorkspaceWithRole[] | undefined>;
	findByIdWithRole(
		id: WorkspaceId,
		userId: UserId
	): Promise<WorkspaceWithRole | undefined>;
	existsByName(name: string): Promise<boolean>;
	existsBySlug(slug: string): Promise<boolean>;
	findPersonalByUserId(userId: UserId): Promise<WorkspaceEntity | undefined>;
	createWithMember(
		workspace: WorkspaceEntity,
		userId: UserId,
		role: WorkspaceMember['role']
	): Promise<WorkspaceWithRole>;
	update(id: WorkspaceId, data: UpdateWorkspaceProps): Promise<WorkspaceEntity>;
}
