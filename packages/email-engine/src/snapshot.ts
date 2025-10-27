import { createHash } from 'node:crypto';
import type { BuilderStructure } from '@requil/db';
import { convertBuilderToHtml } from './builder-to-mjml.js';
import type { TemplateSnapshot } from './types.js';

export const computeSnapshotId = (
	snapshot: Omit<TemplateSnapshot, 'snapshotId'>
): string => {
	const payload = JSON.stringify({
		stableId: snapshot.stableId,
		builderStructure: snapshot.builderStructure ?? null,
		mjml: snapshot.mjml,
		variablesSchema: snapshot.variablesSchema,
		subjectLines: snapshot.subjectLines,
		preheader: snapshot.preheader ?? null,
		notes: snapshot.notes ?? [],
		safetyFlags: snapshot.safetyFlags ?? [],
	});
	return createHash('sha256').update(payload).digest('base64url');
};

export function prepareSnapshotFromBuilder(
	builderStructure: BuilderStructure
): {
	mjml: string;
	html: string;
	builderStructure: BuilderStructure;
	warnings: string[];
} {
	const { html, mjml, warnings } = convertBuilderToHtml(builderStructure);

	return {
		mjml,
		html,
		builderStructure,
		warnings,
	};
}
