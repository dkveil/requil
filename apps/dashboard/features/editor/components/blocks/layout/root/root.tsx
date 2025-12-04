import { useDroppable } from '@dnd-kit/core';
import { EmailRoot } from '@requil/email-engine';
import { cn } from '@/lib/utils';
import { useCanvas } from '../../../../hooks/use-canvas';
import {
	RenderChildren,
	type RenderChildrenProps,
} from '../../../render-children';

export type RootBlockProps = RenderChildrenProps;

export function RootBlock({
	block,
	isCanvas = false,
	viewport = 'desktop',
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
	interactionProps,
}: RootBlockProps) {
	const { canvasWidth } = useCanvas();
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !isCanvas,
	});

	const hasChildren = block.children && block.children.length > 0;
	const width = isCanvas ? canvasWidth : viewport === 'mobile' ? 375 : 'auto';

	return (
		<div
			ref={isCanvas ? setNodeRef : undefined}
			{...interactionProps}
			className={cn(
				interactionProps?.className,
				isOver && isCanvas && 'ring-2 ring-primary ring-inset',
				'w-full'
			)}
			style={{
				width: typeof width === 'number' ? `${width}px` : width,
				maxWidth: '100%',
				margin: '0 auto',
			}}
			data-block-type='Root'
			data-block-id={block.id}
		>
			<EmailRoot
				block={block}
				style={{
					minHeight: !hasChildren && isCanvas ? '400px' : undefined,
					width: '100%',
				}}
				isCanvas
			>
				<RenderChildren
					block={block}
					isCanvas={isCanvas}
					viewport={viewport}
					onSelect={onSelect}
					onHover={onHover}
					selectedBlockId={selectedBlockId}
					hoveredBlockId={hoveredBlockId}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onDelete={onDelete}
					onSelectParent={onSelectParent}
				/>

				{!hasChildren && isCanvas && (
					<div className='min-h-[400px] flex items-center justify-center text-center text-muted-foreground py-16 text-sm'>
						Drag elements here to start building
					</div>
				)}
			</EmailRoot>
		</div>
	);
}
