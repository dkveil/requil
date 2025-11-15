import type { ErrorContext } from '@requil/utils';
import {
	AuthorizationError,
	NotFoundError,
	RequilError,
	ValidationError,
} from '@requil/utils';

export class AssetNotFoundError extends NotFoundError {
	constructor(message = 'Asset not found', context: ErrorContext = {}) {
		super(message, context);
	}
}

export class AssetUploadError extends RequilError {
	constructor(message = 'Asset upload failed', context: ErrorContext = {}) {
		super(message, 'ASSET_UPLOAD_ERROR', 500, context);
	}
}

export class AssetValidationError extends ValidationError {
	constructor(message = 'Invalid asset', context: ErrorContext = {}) {
		super(message, context);
	}
}

export class AssetDeleteError extends RequilError {
	constructor(message = 'Asset deletion failed', context: ErrorContext = {}) {
		super(message, 'ASSET_DELETE_ERROR', 500, context);
	}
}

export class AssetAccessDeniedError extends AuthorizationError {
	constructor(message = 'Access denied', context: ErrorContext = {}) {
		super(message, context);
	}
}
