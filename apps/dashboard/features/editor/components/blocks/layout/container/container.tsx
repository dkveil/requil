import { useDroppable } from '@dnd-kit/core';
import { EmailContainer } from '@requil/email-engine';
import { cn } from '@/lib/utils';
import {
	RenderChildren,
	type RenderChildrenProps,
} from '../../../render-children';

export type ContainerBlockProps = RenderChildrenProps;

export function ContainerBlock({
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
}: ContainerBlockProps) {
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

	return (
		<div
			ref={isCanvas ? setNodeRef : undefined}
			{...interactionProps}
			className={cn(
				interactionProps?.className,
				isOver && isCanvas && 'ring-2 ring-primary ring-inset'
			)}
			data-block-type='Container'
			data-block-id={block.id}
		>
			<EmailContainer block={block}>
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
					<div className='min-h-[100px] flex items-center justify-center text-center text-muted-foreground py-8 text-sm border border-dashed border-muted-foreground/30 rounded'>
						Empty container - drag elements here
					</div>
				)}
			</EmailContainer>
		</div>
	);
}
