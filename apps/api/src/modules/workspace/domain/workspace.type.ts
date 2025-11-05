import type { NewWorkspace, Workspace, WorkspaceMember } from '@requil/db';

export type WorkspaceId = Workspace['id'];
export type UserId = string;

export type WorkspaceProps = Workspace;
export type CreateWorkspaceProps = Pick<NewWorkspace, 'name'>;
export type UpdateWorkspaceProps = Partial<Pick<Workspace, 'name'>>;

export type WorkspaceWithRole = Workspace & {
	role: WorkspaceMember['role'];
	memberSince: WorkspaceMember['invitedAt'];
};
