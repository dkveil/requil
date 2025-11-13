import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
	BlockRendererProps,
	renderChildrenWithDropZones,
} from '../../block-renderer';
import { DropZone } from '../../drop-zone';

interface ContainerBlockProps extends BlockRendererProps {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
	blockType: 'Container' | 'Block' | 'Column';
	additionalStyles?: React.CSSProperties;
	emptyMessage?: string;
}

export function ContainerBlock({
	block,
	isCanvas,
	styles,
	interactionProps,
	blockType,
	additionalStyles,
	emptyMessage,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
}: ContainerBlockProps) {
	const isEmpty = !block.children || block.children.length === 0;
	const [isDropZoneOver, setIsDropZoneOver] = useState(false);

	// Make container droppable (for sidebar items)
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !isCanvas, // Only disable in preview mode
	});

	const htmlTag = (block.props.htmlTag as string) || 'div';
	const Element = htmlTag as React.ElementType;

	// Combine refs: dragRef (from useDraggable) + dropRef (from useDroppable)
	const dragRef = (interactionProps as { ref?: React.Ref<HTMLElement> }).ref;
	const dropRef = setNodeRef;

	const combinedRef = (element: HTMLElement | null) => {
		if (dropRef) dropRef(element);
		if (typeof dragRef === 'function') dragRef(element);
		else if (dragRef && typeof dragRef === 'object' && 'current' in dragRef) {
			(dragRef as React.MutableRefObject<HTMLElement | null>).current = element;
		}
	};

	// aria-label support
	const ariaLabel = block.props.ariaLabel as string | undefined;

	return (
		<Element
			ref={combinedRef as any}
			{...interactionProps}
			style={{
				...styles,
				...additionalStyles,
				...(isEmpty && isCanvas ? { minHeight: '100px' } : {}),
			}}
			className={cn(
				(interactionProps as { className?: string }).className,
				isEmpty &&
					isOver &&
					isCanvas &&
					'bg-primary/20 border-2 border-dashed border-primary rounded ring-inset'
			)}
			data-block-type={blockType}
			data-block-id={block.id}
			aria-label={ariaLabel || undefined}
		>
			{isEmpty && isCanvas ? (
				// When empty, show drop zone with message - drop zone takes full height
				<div className='relative h-full min-h-[100px]'>
					<DropZone
						id={`dropzone-${block.id}-0`}
						parentId={block.id}
						position={0}
						onIsOverChange={setIsDropZoneOver}
						fullHeight={true}
					/>
					<div
						className={cn(
							'absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none transition-opacity duration-200',
							isDropZoneOver && 'opacity-0'
						)}
					>
						{emptyMessage || `Empty ${blockType} - Drop elements here`}
					</div>
				</div>
			) : (
				// When not empty, render children with drop zones between them
				renderChildrenWithDropZones(
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
				)
			)}
		</Element>
	);
}
