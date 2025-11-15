import { randomUUID } from 'node:crypto';
import type { Asset, NewAsset } from '@requil/db';
import { nanoid } from 'nanoid';

type AssetType = 'image' | 'font';
type AssetStatus = 'uploading' | 'ready' | 'error';

export class AssetEntity {
	id: string;
	workspaceId: string;
	type: AssetType;
	status: AssetStatus;
	filename: string;
	originalFilename: string;
	mimeType: string;
	sizeBytes: number;
	storagePath: string;
	publicUrl: string | null;
	width: number | null;
	height: number | null;
	alt: string | null;
	uploadedBy: string;
	createdAt: string;
	updatedAt: string;

	constructor(data: Asset) {
		this.id = data.id;
		this.workspaceId = data.workspaceId;
		this.type = data.type;
		this.status = data.status;
		this.filename = data.filename;
		this.originalFilename = data.originalFilename;
		this.mimeType = data.mimeType;
		this.sizeBytes = data.sizeBytes;
		this.storagePath = data.storagePath;
		this.publicUrl = data.publicUrl;
		this.width = data.width;
		this.height = data.height;
		this.alt = data.alt;
		this.uploadedBy = data.uploadedBy;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
	}

	static create(
		workspaceId: string,
		type: AssetType,
		originalFilename: string,
		mimeType: string,
		sizeBytes: number,
		uploadedBy: string,
		alt?: string
	): NewAsset {
		const timestamp = new Date().toISOString();
		const fileExtension = originalFilename.split('.').pop() || '';
		const filename = `${nanoid()}.${fileExtension}`;
		const storagePath = `${workspaceId}/${type}s/${filename}`;

		return {
			id: randomUUID(),
			workspaceId,
			type,
			status: 'uploading',
			filename,
			originalFilename,
			mimeType,
			sizeBytes,
			storagePath,
			publicUrl: null,
			width: null,
			height: null,
			alt: alt || null,
			uploadedBy,
			createdAt: timestamp,
			updatedAt: timestamp,
		};
	}

	toJSON() {
		return {
			id: this.id,
			workspaceId: this.workspaceId,
			type: this.type,
			status: this.status,
			filename: this.filename,
			originalFilename: this.originalFilename,
			mimeType: this.mimeType,
			sizeBytes: this.sizeBytes,
			storagePath: this.storagePath,
			publicUrl: this.publicUrl,
			width: this.width,
			height: this.height,
			alt: this.alt,
			uploadedBy: this.uploadedBy,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
