'use client';

import type { UpdateTemplateInput } from '@requil/types/templates';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import {
	Code,
	Loader2,
	Minus,
	Monitor,
	Plus,
	Redo2,
	Save,
	Settings,
	Smartphone,
	Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import LogoSmall from '@/components/logo-small';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { templatesApi } from '@/features/templates/api/templates-api';
import { EmailSettingsModal } from '../components/email-settings-modal';
import { HtmlPreviewModal } from '../components/html-preview-modal';
import { useCanvas } from '../hooks/use-canvas';
import { useEditor } from '../hooks/use-editor';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function EditorHeader() {
	const t = useTranslations('editor.header');
	const params = useParams();
	const templateId = params.id as string;
	const { projectName } = useEditor();
	const {
		viewport,
		setViewport,
		zoom,
		setZoom,
		undo,
		redo,
		canUndo,
		canRedo,
		document,
		isModified,
		markAsSaved,
	} = useCanvas();
	const [emailSettingsModalOpen, setEmailSettingsModalOpen] = useState(false);
	const [htmlPreviewModalOpen, setHtmlPreviewModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: dependencies are correct
	const handleSave = useCallback(async () => {
		if (!document || templateId === 'new' || !isModified) return;

		setIsSaving(true);
		try {
			const updateData: UpdateTemplateInput = {
				builderStructure: document as unknown as Record<string, unknown>,
			};

			await templatesApi.update(templateId, updateData);

			markAsSaved();
			toast.success(t('saved'));
		} catch (error) {
			toast.error(t('failedToSave'));
			// biome-ignore lint/suspicious/noConsole: error logging for debugging
			console.error('Save error:', error);
		} finally {
			setIsSaving(false);
		}
	}, [document, templateId, isModified, markAsSaved]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				handleSave();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleSave]);

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-1'>
			<div className='flex h-10 items-center justify-between gap-4 px-4'>
				<div className='flex items-center flex-1 gap-4'>
					<Link href={DASHBOARD_ROUTES.HOME}>
						<LogoSmall
							variant='light'
							size={24}
						/>
					</Link>
					<Separator
						orientation='vertical'
						className=' h-[24px]!'
					/>

					<span className='text-xl uppercase'>{projectName}</span>
					<Separator
						orientation='vertical'
						className=' h-[24px]!'
					/>
					<div className='flex items-center gap-1'>
						<Button
							variant='ghost'
							size='icon-sm'
							onClick={undo}
							disabled={!canUndo}
							title={t('undo')}
						>
							<Undo2 className='h-4 w-4' />
						</Button>
						<Button
							variant='ghost'
							size='icon-sm'
							onClick={redo}
							disabled={!canRedo}
							title={t('redo')}
						>
							<Redo2 className='h-4 w-4' />
						</Button>
					</div>
					<Separator
						orientation='vertical'
						className=' h-[24px]!'
					/>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setEmailSettingsModalOpen(true)}
						title={t('emailSettings')}
					>
						<Settings className='h-4 w-4 mr-1' />
						{t('emailSettings')}
					</Button>
					{isDevelopment && (
						<>
							<Separator
								orientation='vertical'
								className=' h-[24px]!'
							/>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setHtmlPreviewModalOpen(true)}
								title='HTML Preview (Dev Only)'
							>
								<Code className='h-4 w-4 mr-1' />
								HTML Preview
							</Button>
						</>
					)}
				</div>

				<div>
					<Button
						variant='ghost'
						onClick={() => setViewport('desktop')}
						className={
							viewport === 'desktop' ? 'bg-primary text-primary-foreground' : ''
						}
					>
						<Monitor className='h-4 w-4' />
						{t('dekstop')}
					</Button>
					<Button
						variant='ghost'
						onClick={() => setViewport('mobile')}
						className={
							viewport === 'mobile' ? 'bg-primary text-primary-foreground' : ''
						}
					>
						<Smartphone className='h-4 w-4' />
						{t('mobile')}
					</Button>
				</div>

				<div className='flex justify-end items-center flex-1 gap-2'>
					<div className='flex items-center gap-1'>
						<Button
							variant='ghost'
							size='icon-sm'
							onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
							title='Zoom out'
						>
							<Minus className='h-4 w-4' />
						</Button>
						<span className='text-sm font-medium min-w-[60px] text-center text-foreground'>
							{Math.round(zoom * 100)}%
						</span>
						<Button
							variant='ghost'
							size='icon-sm'
							onClick={() => setZoom(Math.min(2, zoom + 0.1))}
							title='Zoom in'
						>
							<Plus className='h-4 w-4' />
						</Button>
					</div>

					<Separator
						orientation='vertical'
						className='h-[36px]!'
					/>
					<Button
						variant='outline'
						disabled
					>
						API
					</Button>
					<Button
						variant='outline'
						disabled
					>
						{t('testEmail')}
					</Button>

					<Separator
						orientation='vertical'
						className='h-[36px]!'
					/>

					<Link href={DASHBOARD_ROUTES.HOME}>
						<Button variant='outline'>{t('exit')}</Button>
					</Link>
					<Button
						variant='default'
						disabled={!isModified || templateId === 'new' || isSaving}
						onClick={handleSave}
					>
						{isSaving ? (
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
						) : (
							<Save className='h-4 w-4 mr-2' />
						)}
						{isSaving ? t('saving') : t('save')}
					</Button>
				</div>
			</div>
			<EmailSettingsModal
				open={emailSettingsModalOpen}
				onOpenChange={setEmailSettingsModalOpen}
			/>
			<HtmlPreviewModal
				open={htmlPreviewModalOpen}
				onOpenChange={setHtmlPreviewModalOpen}
				document={document}
			/>
		</header>
	);
}
