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

type EditorMode = 'workspace' | 'demo';

type EditorHeaderProps = {
	mode?: EditorMode;
};

const isDevelopment = process.env.NODE_ENV === 'development';

export default function EditorHeader({
	mode = 'workspace',
}: EditorHeaderProps) {
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
		previewData,
	} = useCanvas();
	const isDemo = mode === 'demo';
	const [emailSettingsModalOpen, setEmailSettingsModalOpen] = useState(false);
	const [htmlPreviewModalOpen, setHtmlPreviewModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: dependencies are correct
	const handleSave = useCallback(async () => {
		if (isDemo) return;
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
	}, [document, templateId, isModified, markAsSaved, isDemo]);

	useEffect(() => {
		if (isDemo) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				handleSave();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleSave, isDemo]);

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-1'>
			<div className='flex h-10 items-center justify-between gap-1 px-2 sm:gap-2 sm:px-3 lg:gap-4 lg:px-4'>
				<div className='flex items-center flex-1 min-w-0 gap-1 sm:gap-2 lg:gap-4'>
					<Link href={DASHBOARD_ROUTES.HOME}>
						<LogoSmall
							variant='light'
							size={24}
						/>
					</Link>
					<Separator
						orientation='vertical'
						className='h-[24px] hidden lg:block'
					/>

					<span
						className='text-base sm:text-lg lg:text-xl uppercase truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none'
						title={projectName}
					>
						{projectName}
					</span>
					<Separator
						orientation='vertical'
						className='h-[24px] hidden lg:block'
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
						className='h-[24px] hidden md:block'
					/>
					{!isDemo && (
						<Button
							variant='ghost'
							size='icon-sm'
							className='md:w-auto md:px-3'
							onClick={() => setEmailSettingsModalOpen(true)}
							title={t('emailSettings')}
						>
							<Settings className='h-4 w-4 md:mr-1' />
							<span className='hidden md:inline'>{t('emailSettings')}</span>
						</Button>
					)}
					{isDevelopment && (
						<>
							<Separator
								orientation='vertical'
								className='h-[24px] hidden lg:block'
							/>
							<Button
								variant='ghost'
								size='icon-sm'
								className='hidden sm:flex md:w-auto md:px-3'
								onClick={() => setHtmlPreviewModalOpen(true)}
								title='HTML Preview (Dev Only)'
							>
								<Code className='h-4 w-4 md:mr-1' />
								<span className='hidden md:inline'>HTML Preview</span>
							</Button>
						</>
					)}
				</div>

				<div className='flex items-center gap-0'>
					<Button
						variant='ghost'
						size='icon-sm'
						className='md:w-auto md:px-3'
						onClick={() => setViewport('desktop')}
						title={t('dekstop')}
					>
						<Monitor
							className={`h-4 w-4 md:mr-1 ${viewport === 'desktop' ? 'text-primary' : ''}`}
						/>
						<span className='hidden md:inline'>{t('dekstop')}</span>
					</Button>
					<Button
						variant='ghost'
						size='icon-sm'
						className='md:w-auto md:px-3'
						onClick={() => setViewport('mobile')}
						title={t('mobile')}
					>
						<Smartphone
							className={`h-4 w-4 md:mr-1 ${viewport === 'mobile' ? 'text-primary' : ''}`}
						/>
						<span className='hidden md:inline'>{t('mobile')}</span>
					</Button>
				</div>

				<div className='flex justify-end items-center flex-1 min-w-0 gap-1 sm:gap-2'>
					<div className='hidden sm:flex items-center gap-1'>
						<Button
							variant='ghost'
							size='icon-sm'
							onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
							title='Zoom out'
						>
							<Minus className='h-4 w-4' />
						</Button>
						<span className='text-xs lg:text-sm font-medium min-w-[40px] lg:min-w-[60px] text-center text-foreground'>
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
						className='h-[36px] hidden xl:block'
					/>
					<Button
						variant='outline'
						size='sm'
						className='hidden xl:inline-flex'
						disabled
					>
						API
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='hidden xl:inline-flex'
						disabled
					>
						{t('testEmail')}
					</Button>

					<Separator
						orientation='vertical'
						className='h-[36px] hidden md:block'
					/>

					<Link
						href={DASHBOARD_ROUTES.HOME}
						className='hidden sm:block'
					>
						<Button
							variant='outline'
							size='sm'
						>
							{t('exit')}
						</Button>
					</Link>
					{!isDemo && (
						<Button
							variant='default'
							size='sm'
							disabled={!isModified || templateId === 'new' || isSaving}
							onClick={handleSave}
						>
							{isSaving ? (
								<Loader2 className='h-4 w-4 sm:mr-2 animate-spin' />
							) : (
								<Save className='h-4 w-4 sm:mr-2' />
							)}
							<span className='hidden sm:inline'>
								{isSaving ? t('saving') : t('save')}
							</span>
						</Button>
					)}
				</div>
			</div>
			{!isDemo && (
				<EmailSettingsModal
					open={emailSettingsModalOpen}
					onOpenChange={setEmailSettingsModalOpen}
				/>
			)}
			<HtmlPreviewModal
				open={htmlPreviewModalOpen}
				onOpenChange={setHtmlPreviewModalOpen}
				document={document}
				variables={previewData || {}}
			/>
		</header>
	);
}
