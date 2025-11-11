import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DropZoneProps {
	id: string;
	parentId: string;
	position: number;
}

export function DropZone({ id, parentId, position }: DropZoneProps) {
	const { setNodeRef, isOver, active } = useDroppable({
		id,
		data: { type: 'drop-zone', parentId, position },
	});

	const isDraggingCanvasBlock = active?.data?.current?.type === 'canvas-block';

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'transition-all duration-200 -my-1',
				isOver
					? 'h-12 my-2 bg-primary/20 border-2 border-dashed border-primary rounded'
					: 'h-2 opacity-0 hover:opacity-100 hover:bg-primary/10',
				isDraggingCanvasBlock && isOver && 'bg-blue-500/20 border-blue-500'
			)}
		/>
	);
}
