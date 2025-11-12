import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import {
	BlockRendererProps,
	renderChildrenWithDropZones,
} from '../block-renderer';

interface RootBlockProps extends BlockRendererProps {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}

export function RootBlock({
	block,
	isCanvas,
	styles,
	interactionProps,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
}: RootBlockProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
	});

	const children = block.children || [];

	return (
		<div
			ref={setNodeRef}
			{...interactionProps}
			style={{
				...styles,
				width: '600px',
				minHeight: !children.length ? '400px' : undefined,
				margin: '0 auto',
			}}
			className={cn(
				(interactionProps as { className?: string }).className,
				isOver && isCanvas && 'ring-2 ring-primary ring-inset'
			)}
			data-block-type='Root'
			data-block-id={block.id}
		>
			{renderChildrenWithDropZones(
				block,
				isCanvas,
				onSelect,
				onHover,
				selectedBlockId,
				hoveredBlockId,
				onMoveUp,
				onMoveDown,
				onDelete,
				onSelectParent
			)}

			{!children.length && isCanvas && (
				<div className='min-h-[400px] flex items-center justify-center text-center text-muted-foreground py-16 text-sm'>
					Drag elements here to start building
				</div>
			)}
		</div>
	);
}
