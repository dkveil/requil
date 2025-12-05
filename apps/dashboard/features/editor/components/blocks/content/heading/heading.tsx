import { useDroppable } from '@dnd-kit/core';
import { EmailHeading } from '@requil/email-engine';
import { cn } from '@/lib/utils';
import { RenderChildrenProps } from '../../../render-children';

export type HeadingBlockProps = RenderChildrenProps;

export function HeadingBlock({
	block,
	isCanvas = false,
	interactionProps,
}: HeadingBlockProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !isCanvas,
	});

	return (
		<div
			ref={isCanvas ? setNodeRef : undefined}
			{...interactionProps}
			className={cn(
				interactionProps?.className,
				isOver && isCanvas && 'ring-2 ring-primary ring-inset'
			)}
			data-block-type='Heading'
			data-block-id={block.id}
			style={{
				position: isCanvas ? 'relative' : undefined,
			}}
		>
			<EmailHeading block={block} />
		</div>
	);
}
