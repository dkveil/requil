import { createHash } from 'node:crypto';

function sortObjectKeys(obj: unknown): unknown {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(sortObjectKeys);
	}

	const sortedObj: Record<string, unknown> = {};
	const keys = Object.keys(obj).sort();

	for (const key of keys) {
		sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
	}

	return sortedObj;
}

export function hashObject(obj: unknown): string {
	const sortedObj = sortObjectKeys(obj);
	const jsonString = JSON.stringify(sortedObj);
	return createHash('sha256').update(jsonString).digest('hex');
}

export function hashString(str: string): string {
	return createHash('sha256').update(str).digest('hex');
}
