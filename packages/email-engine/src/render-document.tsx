import {
	Body,
	Font,
	Head,
	Html,
	Preview,
	render,
} from '@react-email/components';
import { BlockIR, Document } from '@requil/types';
import { EmailContainer, EmailRoot } from './components';
import { toPlaintext } from './plaintext';

function renderBlock(block: BlockIR): React.ReactNode {
	const children = block.children?.map((child) => renderBlock(child));

	switch (block.type) {
		case 'Root':
			return <EmailRoot block={block}>{children}</EmailRoot>;
		case 'Container':
			return <EmailContainer block={block}>{children}</EmailContainer>;
		default:
			return <div>Unknown block type: {block.type}</div>;
	}
}

type EmailTemplateProps = {
	document: Document;
	previewText?: string;
};

function EmailTemplate({ document, previewText }: EmailTemplateProps) {
	return (
		<Html>
			<Head>
				<Font
					fontFamily='Arial'
					fallbackFontFamily='sans-serif'
				/>
			</Head>
			{previewText && <Preview>{previewText}</Preview>}
			<Body>{renderBlock(document.root)}</Body>
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
	options?: { previewText?: string }
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
		const html = await render(
			<EmailTemplate
				document={document}
				previewText={options?.previewText}
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
