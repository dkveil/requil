import { createHash } from 'node:crypto';

export function hashObject(obj: unknown): string {
	const jsonString = JSON.stringify(obj, Object.keys(obj as object).sort());
	return createHash('sha256').update(jsonString).digest('hex');
}

export function hashString(str: string): string {
	return createHash('sha256').update(str).digest('hex');
}
