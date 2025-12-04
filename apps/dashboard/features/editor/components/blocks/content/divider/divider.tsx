import { useDroppable } from '@dnd-kit/core';
import { EmailDivider } from '@requil/email-engine';
import type { RenderChildrenProps } from '@/features/editor/components/render-children';
import { cn } from '@/lib/utils';

export type DividerBlockProps = RenderChildrenProps;

export const DividerBlock = ({
	block,
	isCanvas = false,
	interactionProps,
}: DividerBlockProps) => {
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
			data-block-type='Divider'
			data-block-id={block.id}
			style={{
				position: isCanvas ? 'relative' : undefined,
			}}
		>
			<EmailDivider block={block} />
		</div>
	);
};
