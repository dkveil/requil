'use client';

import type { Document } from '@requil/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/features/auth';
import { useCanvas } from '@/features/editor/hooks/use-canvas';
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
	const { setDocument } = useCanvas();
	const [templateLoaded, setTemplateLoaded] = useState(false);
	const t = useTranslations('editor');

	useEffect(() => {
		if (accessChecked && templateId && !templateLoaded) {
			loadTemplateById(templateId)
				.then(() => {
					setTemplateLoaded(true);
				})
				.catch((err) => {
					console.error('Failed to load template:', err);
				});
		}
	}, [accessChecked, templateId, templateLoaded, loadTemplateById]);

	useEffect(() => {
		if (currentTemplate && templateLoaded) {
			setProjectName(currentTemplate.name || 'Untitled Project');

			if (currentTemplate.document) {
				const document = currentTemplate.document as unknown as Document;
				setDocument(document);
			}
		}
	}, [currentTemplate, templateLoaded, setProjectName, setDocument]);

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
	}, [user, setDefaultSender]);

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
