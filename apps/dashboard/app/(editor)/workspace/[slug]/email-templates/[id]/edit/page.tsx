import { notFound } from 'next/navigation';
import { EditorClient } from './editor-client';

type Props = {
	params: Promise<{
		slug: string;
		id: string;
	}>;
};

export default async function EmailTemplateEditorPage({ params }: Props) {
	const { slug, id } = await params;

	if (!(id && slug)) {
		notFound();
	}

	return (
		<EditorClient
			workspaceSlug={slug}
			templateId={id}
		/>
	);
}
