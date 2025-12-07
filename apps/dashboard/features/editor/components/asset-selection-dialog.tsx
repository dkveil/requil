'use client';

import { Asset } from '@requil/types';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
	const params = useParams();
	const workspaceId = params.slug as string;

	const handleSelect = (asset: Asset) => {
		onSelect(asset);
		onOpenChange(false);
	};

	if (!workspaceId) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='max-w-4xl h-[80vh] flex flex-col p-0 gap-0'>
				<DialogHeader className='p-6 pb-2'>
					<DialogTitle>{t('selectImage')}</DialogTitle>
				</DialogHeader>
				<div className='flex-1 min-h-0'>
					<AssetsPanel
						workspaceId={workspaceId}
						onSelectAsset={handleSelect}
						filterType='image'
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
