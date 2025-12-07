import { useDroppable } from '@dnd-kit/core';
import { EmailImage } from '@requil/email-engine';
import { Asset } from '@requil/types';
import { Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useCanvas } from '@/features/editor/hooks/use-canvas';
import { cn } from '@/lib/utils';
import { AssetSelectionDialog } from '../../../asset-selection-dialog';
import { RenderChildrenProps } from '../../../render-children';

export type ImageBlockProps = RenderChildrenProps;

export function ImageBlock({
	block,
	isCanvas = false,
	interactionProps,
	selectedBlockId,
}: ImageBlockProps) {
	const t = useTranslations('editor.blocks.image');
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !isCanvas,
	});

	const { updateBlock, startEditing } = useCanvas();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const hasAutoOpened = useRef(false);

	const { className: interactionClassName, ...dragProps } =
		interactionProps || {};

	const src = block.props.src as string;
	const isSelected = selectedBlockId === block.id;

	useEffect(() => {
		if (isCanvas && isSelected && !src && !hasAutoOpened.current) {
			setIsDialogOpen(true);
			hasAutoOpened.current = true;
		}
	}, [isCanvas, isSelected, src]);

	const handleAssetSelect = (asset: Asset) => {
		updateBlock(block.id, {
			props: {
				...block.props,
				src: asset.publicUrl,
				alt: asset.alt || asset.originalFilename,
				width: '100%',
				height: 'auto',
			},
		});
	};

	const handleDoubleClick = (e: React.MouseEvent) => {
		if (isCanvas) {
			e.stopPropagation();
			startEditing(block.id);
			setIsDialogOpen(true);
		}
	};

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Canvas interaction */}
			<div
				ref={isCanvas ? setNodeRef : undefined}
				{...dragProps}
				className={cn(
					interactionClassName,
					isOver && isCanvas && 'ring-2 ring-primary ring-inset',
					'w-full'
				)}
				data-block-type='Image'
				data-block-id={block.id}
				style={{
					position: isCanvas ? 'relative' : undefined,
				}}
				onDoubleClick={handleDoubleClick}
			>
				{src ? (
					<EmailImage
						block={block}
						style={{
							maxWidth: '100%',
							display: 'block',
						}}
					/>
				) : (
					<button
						type='button'
						className={cn(
							'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground transition-colors w-full',
							isCanvas &&
								'cursor-pointer hover:bg-muted/40 hover:border-primary/50'
						)}
						onClick={() => isCanvas && setIsDialogOpen(true)}
					>
						<ImageIcon className='w-10 h-10 mb-2 opacity-50' />
						<p className='text-sm font-medium'>{t('selectImage')}</p>
						<p className='text-xs opacity-70'>{t('clickToBrowse')}</p>
					</button>
				)}
			</div>

			<AssetSelectionDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSelect={handleAssetSelect}
			/>
		</>
	);
}
