import type { ApiKey } from '@requil/db';
import { ApiKeyValidationError } from './api-key.error';
import type {
	ApiKeyId,
	ApiKeyProps,
	CreateApiKeyProps,
	UserId,
	WorkspaceId,
} from './api-key.types';

export class ApiKeyEntity {
	private constructor(private readonly props: ApiKeyProps) {
		this.validate();
	}

	static create(
		props: CreateApiKeyProps,
		workspaceId: WorkspaceId,
		userId: UserId,
		keyPrefix: string,
		keyHash: string
	): ApiKeyEntity {
		const now = new Date().toISOString();

		return new ApiKeyEntity({
			id: crypto.randomUUID(),
			workspaceId,
			name: props.name.trim(),
			keyPrefix,
			keyHash,
			createdBy: userId,
			createdAt: now,
			lastUsedAt: null,
			revokedAt: null,
			expiresAt: props.expiresAt ? props.expiresAt.toISOString() : null,
		});
	}

	static fromPersistence(props: ApiKey): ApiKeyEntity {
		return new ApiKeyEntity({
			id: props.id,
			workspaceId: props.workspaceId,
			name: props.name,
			keyPrefix: props.keyPrefix,
			keyHash: props.keyHash,
			createdBy: props.createdBy,
			createdAt: props.createdAt,
			lastUsedAt: props.lastUsedAt,
			revokedAt: props.revokedAt,
			expiresAt: props.expiresAt,
		});
	}

	private validate(): void {
		if (!this.props.name || this.props.name.trim().length === 0) {
			throw new ApiKeyValidationError('Name is required');
		}

		if (this.props.name.length < 1 || this.props.name.length > 255) {
			throw new ApiKeyValidationError(
				'Name must be between 1 and 255 characters'
			);
		}

		if (!this.props.keyPrefix || this.props.keyPrefix.trim().length === 0) {
			throw new ApiKeyValidationError('Key prefix is required');
		}

		if (!this.props.keyHash || this.props.keyHash.trim().length === 0) {
			throw new ApiKeyValidationError('Key hash is required');
		}

		if (this.props.expiresAt) {
			const expiryDate = new Date(this.props.expiresAt);
			if (expiryDate <= new Date()) {
				throw new ApiKeyValidationError('Expiry date must be in the future');
			}
		}
	}

	revoke(): void {
		this.props.revokedAt = new Date().toISOString();
	}

	updateLastUsedAt(): void {
		this.props.lastUsedAt = new Date().toISOString();
	}

	isRevoked(): boolean {
		return this.props.revokedAt !== null;
	}

	isExpired(): boolean {
		if (!this.props.expiresAt) return false;
		return new Date(this.props.expiresAt) <= new Date();
	}

	isActive(): boolean {
		return !(this.isRevoked() || this.isExpired());
	}

	get id(): ApiKeyId {
		return this.props.id;
	}

	get workspaceId(): WorkspaceId {
		return this.props.workspaceId;
	}

	get name(): string {
		return this.props.name;
	}

	get keyPrefix(): string {
		return this.props.keyPrefix;
	}

	get keyHash(): string {
		return this.props.keyHash;
	}

	get createdBy(): UserId | null {
		return this.props.createdBy;
	}

	get createdAt(): string {
		return this.props.createdAt;
	}

	get lastUsedAt(): string | null {
		return this.props.lastUsedAt;
	}

	get revokedAt(): string | null {
		return this.props.revokedAt;
	}

	get expiresAt(): string | null {
		return this.props.expiresAt;
	}

	toPersistence(): ApiKey {
		return {
			id: this.props.id,
			workspaceId: this.props.workspaceId,
			name: this.props.name,
			keyPrefix: this.props.keyPrefix,
			keyHash: this.props.keyHash,
			createdBy: this.props.createdBy,
			createdAt: this.props.createdAt,
			lastUsedAt: this.props.lastUsedAt,
			revokedAt: this.props.revokedAt,
			expiresAt: this.props.expiresAt,
		};
	}
}
