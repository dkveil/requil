import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import {
	BlockRendererProps,
	renderChildrenWithDropZones,
} from '../block-renderer';

interface ContainerBlockProps extends BlockRendererProps {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
	blockType: 'Container' | 'Section' | 'Column';
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
}: ContainerBlockProps) {
	const isEmpty = !block.children || block.children.length === 0;

	const shouldBeDroppable = isEmpty && isCanvas;
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !shouldBeDroppable,
	});

	const Element = blockType === 'Section' ? 'section' : 'div';

	return (
		<Element
			ref={isEmpty && isCanvas ? setNodeRef : undefined}
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
		>
			{isEmpty && isCanvas ? (
				// When empty, show message without drop zones - entire container is droppable
				<div className='text-center text-gray-400 py-8 text-sm'>
					{emptyMessage || `Empty ${blockType} - Drop elements here`}
				</div>
			) : (
				// When not empty, render children with drop zones between them
				renderChildrenWithDropZones(
					block,
					isCanvas,
					onSelect,
					onHover,
					selectedBlockId,
					hoveredBlockId
				)
			)}
		</Element>
	);
}
