import { createHash } from 'node:crypto';
import type { TemplateSnapshot } from './types.js';

export const computeSnapshotId = (
	snapshot: Omit<TemplateSnapshot, 'snapshotId'>
): string => {
	const payload = JSON.stringify({
		stableId: snapshot.stableId,
		mjml: snapshot.mjml,
		variablesSchema: snapshot.variablesSchema,
		subjectLines: snapshot.subjectLines,
		preheader: snapshot.preheader ?? null,
		notes: snapshot.notes ?? [],
		safetyFlags: snapshot.safetyFlags ?? [],
	});
	return createHash('sha256').update(payload).digest('base64url');
};
