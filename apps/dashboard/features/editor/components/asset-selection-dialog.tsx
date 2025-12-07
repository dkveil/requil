'use client';

import { Asset } from '@requil/types';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { AssetsPanel } from './assets-panel';

interface AssetSelectionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (asset: Asset) => void;
}

export function AssetSelectionDialog({
	open,
	onOpenChange,
	onSelect,
}: AssetSelectionDialogProps) {
	const t = useTranslations('editor.assets');
	const { currentWorkspace } = useWorkspace();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onOpenChange(false);
		};
		if (open) {
			document.addEventListener('keydown', handleEsc);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.removeEventListener('keydown', handleEsc);
			document.body.style.overflow = '';
		};
	}, [open, onOpenChange]);

	const handleSelect = (asset: Asset) => {
		onSelect(asset);
		onOpenChange(false);
	};

	const shouldRender = currentWorkspace?.id && mounted && open;
	if (!shouldRender) return null;

	return createPortal(
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Overlay */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: Overlay click handler */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Overlay click handler */}
			<div
				className='fixed inset-0 bg-black/50 transition-opacity animate-in fade-in-0'
				onClick={() => onOpenChange(false)}
			/>

			{/* Content */}
			<div
				className='relative z-50 w-full max-w-2xl h-[80vh] flex flex-col gap-0 border bg-background shadow-lg sm:rounded-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex flex-col p-6 pb-2 space-y-1.5 text-center sm:text-left'>
					<h2 className='text-lg font-semibold leading-none tracking-tight'>
						{t('selectImage')}
					</h2>
				</div>

				<button
					type='button'
					onClick={() => onOpenChange(false)}
					className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
				>
					<X className='h-4 w-4' />
					<span className='sr-only'>Close</span>
				</button>

				<div className='flex-1 min-h-0'>
					<AssetsPanel
						workspaceId={currentWorkspace?.id}
						onSelectAsset={handleSelect}
						filterType='image'
						autoSelectOnUpload
					/>
				</div>
			</div>
		</div>,
		document.body
	);
}
