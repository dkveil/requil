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
	const params = useParams();
	const { currentWorkspace } = useWorkspace();

	const workspaceId = (params?.slug as string) || currentWorkspace?.id;

	const handleSelect = (asset: Asset) => {
		onSelect(asset);
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent
				className='max-w-4xl h-[80vh] flex flex-col p-0 gap-0'
				onInteractOutside={(e) => e.preventDefault()}
				onPointerDownOutside={(e) => e.preventDefault()}
				onFocusOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<DialogHeader className='p-6 pb-2'>
					<DialogTitle>{t('selectImage')}</DialogTitle>
				</DialogHeader>
				<div className='flex-1 min-h-0'>
					{workspaceId ? (
						<AssetsPanel
							workspaceId={workspaceId}
							onSelectAsset={handleSelect}
							filterType='image'
						/>
					) : (
						<div className='flex items-center justify-center h-full text-muted-foreground'>
							Loading...
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
