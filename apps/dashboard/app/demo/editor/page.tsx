import { notFound } from 'next/navigation';
import EditorLayout from '@/features/editor/layout/editor-layout';
import { generatePageMetadata } from '@/lib/metadata';

const IS_ACCESS_GRANTED = true;

export async function generateMetadata() {
	return generatePageMetadata('demo');
}

export default function DemoEditorPage() {
	if (!IS_ACCESS_GRANTED) {
		return notFound();
	}

	return <EditorLayout mode='demo' />;
}
