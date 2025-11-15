'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/features/auth';
import EditorLayout from '@/features/editor/layout/editor-layout';
import { useEditorStore } from '@/features/editor/store/editor-store';
import { useTemplateStore } from '@/features/templates';
import { useWorkspace } from '@/features/workspace';
import { useWorkspaceAccess } from '@/features/workspace/hooks/use-workspace-access';

type Props = {
	workspaceSlug: string;
	templateId: string;
};

export function EditorClient({ workspaceSlug, templateId }: Props) {
	const { accessChecked } = useWorkspaceAccess(workspaceSlug);
	const { currentWorkspace } = useWorkspace();
	const user = useAuthStore((state) => state.user);
	const { currentTemplate, loading, error, loadTemplateById } =
		useTemplateStore();
	const { setProjectName, setDefaultSender } = useEditorStore();
	const t = useTranslations('editor');

	// biome-ignore lint/correctness/useExhaustiveDependencies: not needed
	useEffect(() => {
		if (accessChecked && templateId) {
			loadTemplateById(templateId, () => {
				setProjectName(currentTemplate?.name || 'Untitled Project');
			});
		}
	}, [accessChecked, templateId, loadTemplateById]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: not needed
	useEffect(() => {
		if (user?.email) {
			const email = user.email;
			const name =
				email
					.split('@')[0]
					?.replace(/[._-]/g, ' ')
					.replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? '';
			setDefaultSender(email, name);
		}
	}, [user]);

	if (!accessChecked || loading) {
		return <LoadingScreen text={t('loading')} />;
	}

	if (error || !currentTemplate) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-foreground'>
						{t('templateNotFound')}
					</h2>
					<p className='text-muted-foreground mt-2'>
						{error || t('unableToLoadTemplate')}
					</p>
				</div>
			</div>
		);
	}

	if (!currentWorkspace?.id) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-foreground'>
						Workspace not found
					</h2>
				</div>
			</div>
		);
	}

	return <EditorLayout workspaceId={currentWorkspace.id} />;
}
