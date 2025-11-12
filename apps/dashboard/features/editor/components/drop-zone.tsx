import { useDroppable } from '@dnd-kit/core';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
	id: string;
	parentId: string;
	position: number;
	onIsOverChange?: (isOver: boolean) => void;
	fullHeight?: boolean;
}

export function DropZone({
	id,
	parentId,
	position,
	onIsOverChange,
	fullHeight = false,
}: DropZoneProps) {
	const { setNodeRef, isOver, active } = useDroppable({
		id,
		data: { type: 'drop-zone', parentId, position },
	});

	const isDraggingCanvasBlock = active?.data?.current?.type === 'canvas-block';
	const isDragging = active !== null;

	useEffect(() => {
		onIsOverChange?.(isOver);
	}, [isOver, onIsOverChange]);

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'transition-all duration-200',
				fullHeight
					? // Full height mode for empty containers
						cn(
							'absolute inset-0',
							isOver
								? 'bg-primary/20 border-2 border-dashed border-primary rounded'
								: isDragging
									? 'opacity-30 bg-primary/10 border border-dashed border-primary/30 rounded'
									: 'opacity-0',
							isDraggingCanvasBlock &&
								isOver &&
								'bg-blue-500/20 border-blue-500'
						)
					: // Normal mode for drop zones between blocks
						cn(
							isOver
								? 'h-12 my-2 bg-primary/20 border-2 border-dashed border-primary rounded'
								: isDragging
									? 'h-8 my-1 opacity-30 bg-primary/10 border border-dashed border-primary/30 rounded'
									: 'h-0 opacity-0 hover:opacity-50 hover:bg-primary/10',
							isDraggingCanvasBlock &&
								isOver &&
								'bg-blue-500/20 border-blue-500'
						)
			)}
		/>
	);
}
