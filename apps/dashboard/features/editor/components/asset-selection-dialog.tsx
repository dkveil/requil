'use client';

import { Asset } from '@requil/types';
import { useTranslations } from 'next-intl';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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

	const handleSelect = (asset: Asset) => {
		onSelect(asset);
		onOpenChange(false);
	};

	if (!currentWorkspace?.id) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent
				className='max-w-4xl h-[80vh] flex flex-col p-0 gap-0'
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className='p-6 pb-2'>
					<DialogTitle>{t('selectImage')}</DialogTitle>
				</DialogHeader>
				<div className='flex-1 min-h-0'>
					<AssetsPanel
						workspaceId={currentWorkspace?.id}
						onSelectAsset={handleSelect}
						filterType='image'
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
