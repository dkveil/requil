import { useDroppable } from '@dnd-kit/core';
import type { RenderChildrenProps } from '@/features/editor/components/render-children';
import { RenderChildren } from '@/features/editor/components/render-children';
import { extractWrapperStyles } from '@/features/editor/lib/canvas-utils';
import { cn } from '@/lib/utils';

export type SectionBlockProps = RenderChildrenProps;

export function SectionBlock({
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
}: SectionBlockProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !isCanvas,
	});

	const hasChildren = Boolean(block.children && block.children.length > 0);
	const extractedWrapperStyles = extractWrapperStyles(block.props, hasChildren);

	return (
		<div
			ref={isCanvas ? setNodeRef : undefined}
			{...interactionProps}
			className={cn(
				interactionProps?.className,
				isOver && isCanvas && 'ring-2 ring-primary ring-inset'
			)}
			data-block-type='Section'
			data-block-id={block.id}
			style={{
				position: !hasChildren && isCanvas ? 'relative' : undefined,
				...extractedWrapperStyles,
			}}
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
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						textAlign: 'center',
						pointerEvents: 'none',
					}}
					className='text-muted-foreground text-sm border border-dashed border-muted-foreground/30 rounded'
				>
					Empty section - drag elements here
				</div>
			)}
		</div>
	);
}
