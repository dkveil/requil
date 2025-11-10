'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useEditor } from '@/features/editor/hooks/use-editor';
import EditorLayout from '@/features/editor/layout/editor-layout';
import { useEditorStore } from '@/features/editor/store/editor-store';
import { useTemplateStore } from '@/features/templates';
import { useWorkspaceAccess } from '@/features/workspace/hooks/use-workspace-access';

type Props = {
	workspaceSlug: string;
};

export function EditorClient({ workspaceSlug }: Props) {
	const params = useParams();
	const templateId = params.id as string;

	const { accessChecked } = useWorkspaceAccess(workspaceSlug);
	const { currentTemplate, loading, error, loadTemplateById } =
		useTemplateStore();
	const { setProjectName } = useEditorStore();
	const { projectName } = useEditor();

	useEffect(() => {
		if (accessChecked && templateId) {
			loadTemplateById(templateId);
		}
	}, [accessChecked, templateId, loadTemplateById]);

	useEffect(() => {
		if (currentTemplate) {
			setProjectName(currentTemplate.name);
		}
	}, [currentTemplate, setProjectName]);

	if (!accessChecked || loading) {
		return <LoadingScreen text='Loading editor...' />;
	}

	if (error || !currentTemplate) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-foreground'>
						Template not found
					</h2>
					<p className='text-muted-foreground mt-2'>
						{error || 'Unable to load template'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<EditorLayout>
			<div className='p-8'>
				<h2 className='text-xl font-semibold'>Template Editor</h2>
				<p className='text-muted-foreground mt-2'>
					Editing: <span className='font-medium'>{projectName}</span>
				</p>
				<p className='text-sm text-muted-foreground mt-4'>
					Template ID: {currentTemplate.id}
					<br />
					Stable ID: {currentTemplate.stableId}
				</p>
				<div className='mt-6 rounded-lg border p-4'>
					<p className='text-sm text-muted-foreground'>
						Editor content will be implemented here. This is where the email
						builder will go.
					</p>
				</div>
			</div>
		</EditorLayout>
	);
}
