import { useDroppable } from '@dnd-kit/core';
import { EmailHeading } from '@requil/email-engine';
import { useCanvas } from '@/features/editor/hooks/use-canvas';
import { cn } from '@/lib/utils';
import { InlineTextEditor } from '../../../inline-text-editor';
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
	const { editingBlockId, updateBlock, stopEditing, startEditing } =
		useCanvas();

	const { className: interactionClassName, ...dragProps } =
		interactionProps || {};

	const isEditing = isCanvas && editingBlockId === block.id;

	const handleDoubleClick = (e: React.MouseEvent) => {
		if (isCanvas) {
			e.stopPropagation();
			startEditing(block.id);
		}
	};

	const handleChange = (newValue: string) => {
		updateBlock(block.id, {
			props: {
				...block.props,
				content: newValue,
			},
		});
	};

	const handleComplete = () => {
		stopEditing();
	};

	return (
		<div
			ref={isCanvas ? setNodeRef : undefined}
			{...(isEditing ? {} : dragProps)}
			className={cn(
				interactionClassName,
				isOver && isCanvas && 'ring-2 ring-primary ring-inset'
			)}
			data-block-type='Heading'
			data-block-id={block.id}
			style={{
				position: isCanvas ? 'relative' : undefined,
			}}
			onDoubleClick={handleDoubleClick}
		>
			{isEditing ? (
				<EmailHeading block={block}>
					<InlineTextEditor
						value={block.props.content as string}
						onChange={handleChange}
						onComplete={handleComplete}
						multiline={true}
					/>
				</EmailHeading>
			) : (
				<EmailHeading block={block} />
			)}
		</div>
	);
}
