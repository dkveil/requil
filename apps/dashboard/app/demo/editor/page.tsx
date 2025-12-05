import { notFound } from 'next/navigation';
import EditorLayout from '@/features/editor/layout/editor-layout';

const IS_ACCESS_GRANTED = true;

export default function DemoEditorPage() {
	if (!IS_ACCESS_GRANTED) {
		return notFound();
	}

	return <EditorLayout mode='demo' />;
}
