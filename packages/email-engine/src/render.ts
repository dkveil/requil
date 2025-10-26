import { Liquid } from 'liquidjs';
import mjml2html from 'mjml';
import { analyzeAndFixHtml } from './guardrails.js';
import { toPlaintext } from './plaintext.js';
import type { RenderInput, RenderOutput } from './types.js';
import { validateVariables } from './validate.js';

const engine = new Liquid({ cache: false, strictVariables: false });

export const compileMjml = (
	mjml: string
): { html: string; warnings: string[] } => {
	const { html, errors } = mjml2html(mjml);
	const warnings = (
		errors as Array<{ formattedMessage?: string; message?: string }>
	).map((e) => e.formattedMessage || e.message || 'MJML warning');
	return { html, warnings };
};

export async function renderRecipient(
	input: RenderInput
): Promise<RenderOutput> {
	const { snapshot, variables, mode, subject, preheader } = input;
	const subjectCandidate = subject ?? snapshot.subjectLines[0] ?? '';
	const preheaderCandidate = preheader ?? snapshot.preheader ?? '';

	const validation = validateVariables(
		snapshot.variablesSchema,
		variables,
		mode
	);
	if (!validation.ok) {
		throw new Error(
			`Variables validation failed: ${validation.errors.join(', ')}`
		);
	}

	const compiled = compileMjml(snapshot.mjml);
	const template = engine.parse(compiled.html);
	const ctx = validation.data;
	const renderedHtml = await engine.render(template, ctx);

	const analyzed = analyzeAndFixHtml(renderedHtml);
	if (analyzed.errors.length > 0) {
		throw new Error(`Guardrails failed: ${analyzed.errors.join('; ')}`);
	}

	const plaintext = toPlaintext(analyzed.html);
	return {
		html: analyzed.html,
		plaintext,
		warnings: compiled.warnings,
		usedSubject: subjectCandidate,
		usedPreheader: preheaderCandidate || undefined,
		sizeBytes: analyzed.sizeBytes,
	};
}
