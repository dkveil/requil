import type { Workspace } from '@requil/db';
import { WorkspaceValidationError } from './workspace.error';
import type {
	CreateWorkspaceProps,
	UserId,
	WorkspaceId,
	WorkspaceProps,
} from './workspace.type';

export class WorkspaceEntity {
	private constructor(private readonly props: WorkspaceProps) {
		this.validate();
	}

	static create(props: CreateWorkspaceProps, userId: UserId): WorkspaceEntity {
		const now = new Date().toISOString();
		return new WorkspaceEntity({
			id: crypto.randomUUID(),
			name: props.name.trim(),
			type: 'personal' as const, // MVP: hardcoded to personal
			createdBy: userId,
			createdAt: now,
		});
	}

	static fromPersistence(props: Workspace): WorkspaceEntity {
		return new WorkspaceEntity(props);
	}

	private validate(): void {
		if (!this.props.name || this.props.name.trim().length === 0) {
			throw new WorkspaceValidationError('Name is required');
		}

		if (this.props.name.length < 2) {
			throw new WorkspaceValidationError(
				'Name must be at least 2 characters long'
			);
		}

		if (this.props.name.length > 255) {
			throw new WorkspaceValidationError(
				'Name must be at most 255 characters long'
			);
		}
	}

	updateName(name: string): void {
		this.props.name = name.trim();
		this.validate();
	}

	get id(): WorkspaceId {
		return this.props.id;
	}

	get name(): string {
		return this.props.name;
	}

	get createdBy(): string {
		return this.props.createdBy || '';
	}

	get createdAt(): string {
		return this.props.createdAt;
	}

	get type(): 'personal' | 'team' {
		return this.props.type;
	}

	toPersistence(): Workspace {
		return {
			id: this.props.id,
			name: this.props.name,
			type: this.props.type,
			createdBy: this.props.createdBy,
			createdAt: this.props.createdAt,
		};
	}
}
