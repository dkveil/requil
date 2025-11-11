'use client';

import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import EditorLayout from '@/features/editor/layout/editor-layout';
import { useTemplateStore } from '@/features/templates';
import { useWorkspaceAccess } from '@/features/workspace/hooks/use-workspace-access';

type Props = {
	workspaceSlug: string;
	templateId: string;
};

export function EditorClient({ workspaceSlug, templateId }: Props) {
	const { accessChecked } = useWorkspaceAccess(workspaceSlug);
	const { currentTemplate, loading, error, loadTemplateById } =
		useTemplateStore();

	useEffect(() => {
		if (accessChecked && templateId) {
			loadTemplateById(templateId);
		}
	}, [accessChecked, templateId, loadTemplateById]);

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

	return <EditorLayout />;
}
