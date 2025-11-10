import { notFound } from 'next/navigation';
import { EditorClient } from './editor-client';

type Props = {
	params: {
		slug: string;
		id: string;
	};
};

export default async function EmailTemplateEditorPage({ params }: Props) {
	const { slug, id } = params;

	if (!(id && slug)) {
		notFound();
	}

	return <EditorClient workspaceSlug={slug} />;
}
