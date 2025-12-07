import { Template } from '@requil/db';
import type { Document } from '@requil/types';
import { TemplateResponse } from '@requil/types';
import { TemplateValidationError } from './template.error';
import { CreateTemplateProps, TemplateProps, UserId } from './templates.types';

const STABLE_ID_REGEX = /^[a-z0-9_-]+$/;

export class TemplateEntity {
	private constructor(private readonly props: TemplateProps) {
		this.validate();
	}

	static create(props: CreateTemplateProps, userId: UserId): TemplateEntity {
		const now = new Date().toISOString();
		return new TemplateEntity({
			id: crypto.randomUUID(),
			workspaceId: props.workspaceId,
			stableId: props.stableId.toLowerCase().trim(),
			name: props.name,
			description: props.description ?? null,
			document: (props.document as Document) ?? null,
			variablesSchema: props.variablesSchema ?? null,
			subjectLines: props.subjectLines ?? null,
			preheader: props.preheader ?? null,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});
	}

	static fromPersistence(props: Template): TemplateEntity {
		return new TemplateEntity(props);
	}

	private validate(): void {
		if (!this.props.stableId || this.props.stableId.trim().length === 0) {
			throw new TemplateValidationError('Stable ID is required');
		}

		if (this.props.stableId.length < 3) {
			throw new TemplateValidationError(
				'Stable ID must be at least 3 characters long'
			);
		}

		if (this.props.stableId.length > 100) {
			throw new TemplateValidationError(
				'Stable ID must be at most 100 characters long'
			);
		}

		if (!STABLE_ID_REGEX.test(this.props.stableId)) {
			throw new TemplateValidationError(
				'Stable ID must contain only lowercase letters, numbers, underscores, and hyphens'
			);
		}

		if (!this.props.workspaceId) {
			throw new TemplateValidationError('Workspace ID is required');
		}

		if (this.props.name && this.props.name.length > 255) {
			throw new TemplateValidationError(
				'Name must be at most 255 characters long'
			);
		}

		if (this.props.description && this.props.description.length > 1000) {
			throw new TemplateValidationError(
				'Description must be at most 1000 characters long'
			);
		}

		if (this.props.preheader && this.props.preheader.length > 255) {
			throw new TemplateValidationError(
				'Preheader must be at most 255 characters long'
			);
		}
	}

	updateName(name: string): void {
		this.props.name = name.trim();
		this.props.updatedAt = new Date().toISOString();
		this.validate();
	}

	updateContent(data: { document?: Document }): void {
		if (data.document !== undefined) {
			this.props.document = data.document as unknown as any;
		}
		this.props.updatedAt = new Date().toISOString();
	}

	get id(): string {
		return this.props.id;
	}

	get workspaceId(): string {
		return this.props.workspaceId;
	}

	get stableId(): string {
		return this.props.stableId;
	}

	get name(): string {
		return this.props.name;
	}

	get description(): string | null {
		return this.props.description;
	}

	get document(): Document | null {
		return (this.props.document as Document) ?? null;
	}

	get createdBy(): string {
		return this.props.createdBy;
	}

	get createdAt(): string {
		return this.props.createdAt;
	}

	get updatedAt(): string {
		return this.props.updatedAt;
	}

	toPersistence(): Template {
		return { ...this.props };
	}

	toResponse(): TemplateResponse {
		return {
			id: this.props.id,
			workspaceId: this.props.workspaceId,
			stableId: this.props.stableId,
			name: this.props.name,
			description: this.props.description,
			document: (this.props.document as Document) ?? null,
			variablesSchema: this.props.variablesSchema ?? null,
			subjectLines: this.props.subjectLines,
			preheader: this.props.preheader,
			createdBy: this.props.createdBy,
			createdAt: this.props.createdAt,
			updatedAt: this.props.updatedAt,
		};
	}
}
