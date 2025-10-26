import { describe, expect, it } from 'vitest';
import { compileMjml, renderRecipient } from '../../src/render.js';

const snapshot = {
	stableId: 'welcome',
	snapshotId: 'dummy',
	mjml: `
<mjml>
  <mj-body>
    <mj-text>Hello {{firstName}}</mj-text>
    <mj-button href="https://example.com">Go</mj-button>
  </mj-body>
</mjml>`,
	variablesSchema: {
		type: 'object',
		properties: { firstName: { type: 'string', default: 'Friend' } },
		required: [],
		additionalProperties: true,
	},
	subjectLines: ['Hello'],
} as const;

describe('compileMjml + renderRecipient', () => {
	it('compiles MJML and renders Liquid', async () => {
		const compiled = compileMjml(snapshot.mjml);
		expect(compiled.html).toContain('<html');
		const out = await renderRecipient({
			snapshot: snapshot as any,
			variables: { firstName: 'John' },
			mode: 'permissive',
		});
		expect(out.html).toContain('Hello John');
		expect(out.usedSubject).toBe('Hello');
		expect(out.plaintext.length).toBeGreaterThan(0);
	});
});
