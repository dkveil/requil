import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DropZoneProps {
	id: string;
	parentId: string;
	position: number;
}

export function DropZone({ id, parentId, position }: DropZoneProps) {
	const { setNodeRef, isOver } = useDroppable({
		id,
		data: {
			type: 'drop-zone',
			parentId,
			position,
		},
	});

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'transition-all duration-200 -my-1',
				isOver
					? 'h-12 my-2 bg-primary/20 border-2 border-dashed border-primary rounded'
					: 'h-2 opacity-0 hover:opacity-100 hover:bg-primary/10'
			)}
		/>
	);
}
