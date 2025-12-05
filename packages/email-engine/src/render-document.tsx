import { Font, Head, Html, Preview, render } from '@react-email/components';
import { BlockIR, Document } from '@requil/types';
import {
	EmailContainer,
	EmailDivider,
	EmailHeading,
	EmailRoot,
	EmailSection,
} from './components';
import { toPlaintext } from './plaintext';

type RenderContext = {
	variables?: Record<string, string>;
};

function renderBlock(block: BlockIR, context: RenderContext): React.ReactNode {
	const children = block.children?.map((child) => renderBlock(child, context));

	switch (block.type) {
		case 'Root':
			return <EmailRoot block={block}>{children}</EmailRoot>;
		case 'Container':
			return <EmailContainer block={block}>{children}</EmailContainer>;
		case 'Section':
			return <EmailSection block={block}>{children}</EmailSection>;
		case 'Divider':
			return <EmailDivider block={block} />;
		case 'Heading':
			return (
				<EmailHeading
					block={block}
					variables={context.variables}
				/>
			);
		default:
			return <div>Unknown block type: {block.type}</div>;
	}
}

type EmailTemplateProps = {
	document: Document;
	previewText?: string;
	variables?: Record<string, string>;
};

function EmailTemplate({
	document,
	previewText,
	variables,
}: EmailTemplateProps) {
	return (
		<Html>
			<Head>
				<Font
					fontFamily='Arial'
					fallbackFontFamily='sans-serif'
				/>
			</Head>
			{previewText && <Preview>{previewText}</Preview>}
			{renderBlock(document.root, { variables })}
		</Html>
	);
}

export type RenderResult = {
	html: string;
	plaintext: string;
	warnings: string[];
	errors: string[];
};

export async function renderDocumentToHtml(
	document: Document,
	options?: { previewText?: string; variables?: Record<string, string> }
): Promise<RenderResult> {
	const errors: string[] = [];

	if (!document.root) {
		return {
			html: '',
			plaintext: '',
			warnings: [],
			errors: ['Document has no root block'],
		};
	}

	try {
		const variablesMap: Record<string, string> = {};
		for (const v of document.variables || []) {
			variablesMap[v.name] =
				options?.variables?.[v.name] ?? v.defaultValue ?? '';
		}

		const html = await render(
			<EmailTemplate
				document={document}
				previewText={options?.previewText}
				variables={variablesMap}
			/>,
			{ pretty: true }
		);

		return { html, plaintext: toPlaintext(html), warnings: [], errors };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		errors.push(`Render error: ${message}`);
		return { html: '', plaintext: '', warnings: [], errors };
	}
}
