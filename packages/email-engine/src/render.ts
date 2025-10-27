import { Liquid } from 'liquidjs';
import mjml2html from 'mjml';
import { convertBuilderToHtml } from './builder-to-mjml';
import { analyzeAndFixHtml } from './guardrails';
import { toPlaintext } from './plaintext';
import type {
	BuilderRenderInput,
	RenderInput,
	RenderOutput,
	TemplateSnapshot,
} from './types';
import { validateVariables } from './validate';
import { validateBuilderStructure } from './validate-builder';

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

export async function renderFromBuilder(
	input: BuilderRenderInput
): Promise<RenderOutput> {
	const { builderStructure, variablesSchema, subjectLines, preheader } = input;

	const builderValidation = validateBuilderStructure(builderStructure);
	if (!builderValidation.ok) {
		throw new Error(
			`Builder structure validation failed: ${builderValidation.errors.map((e) => e.message).join(', ')}`
		);
	}

	const conversionResult = convertBuilderToHtml(builderStructure);
	const { mjml: generatedMjml } = conversionResult;

	const snapshot: TemplateSnapshot = {
		stableId: 'builder-draft',
		snapshotId: 'preview',
		builderStructure,
		mjml: generatedMjml,
		variablesSchema,
		subjectLines,
		preheader,
	};

	const result = await renderRecipient({ ...input, snapshot });

	return {
		...result,
		warnings: [
			...conversionResult.warnings,
			...builderValidation.warnings,
			...result.warnings,
		],
	};
}
