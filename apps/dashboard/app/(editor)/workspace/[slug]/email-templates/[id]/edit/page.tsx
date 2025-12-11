import { notFound } from 'next/navigation';
import { generatePageMetadata } from '@/lib/metadata';
import { EditorClient } from './editor-client';

type Props = {
	params: Promise<{
		slug: string;
		id: string;
	}>;
};

export async function generateMetadata() {
	return generatePageMetadata('editor');
}

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
