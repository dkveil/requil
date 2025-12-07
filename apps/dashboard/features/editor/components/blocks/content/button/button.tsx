import { useDroppable } from '@dnd-kit/core';
import { EmailButton, replaceVariables } from '@requil/email-engine';
import { useCanvas } from '@/features/editor/hooks/use-canvas';
import { cn } from '@/lib/utils';
import { InlineTextEditor } from '../../../inline-text-editor';
import { RenderChildrenProps } from '../../../render-children';

export type ButtonBlockProps = RenderChildrenProps;

export function ButtonBlock({
	block,
	isCanvas = false,
	interactionProps,
}: ButtonBlockProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `block-${block.id}`,
		data: {
			type: 'block',
			blockId: block.id,
			accepts: ['sidebar'],
		},
		disabled: !isCanvas,
	});
	const {
		editingBlockId,
		updateBlock,
		stopEditing,
		startEditing,
		previewMode,
		previewData,
	} = useCanvas();

	const { className: interactionClassName, ...dragProps } =
		interactionProps || {};

	const isEditing = isCanvas && editingBlockId === block.id;
	const displayContent =
		!isEditing && previewMode
			? replaceVariables(block.props.content as string, previewData)
			: (block.props.content as string);

	const handleDoubleClick = (e: React.MouseEvent) => {
		if (isCanvas) {
			e.stopPropagation();
			e.preventDefault();
			startEditing(block.id);
		}
	};

	const handleClick = (e: React.MouseEvent) => {
		if (isCanvas) {
			e.preventDefault();
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
				isOver && isCanvas && 'ring-2 ring-primary ring-inset',
				'inline-block w-full'
			)}
			data-block-type='Button'
			data-block-id={block.id}
			style={{
				position: isCanvas ? 'relative' : undefined,
			}}
			onDoubleClick={handleDoubleClick}
			onClick={handleClick}
		>
			<EmailButton
				block={block}
				canvasContent={isEditing ? null : displayContent}
			>
				{isEditing && (
					<InlineTextEditor
						value={(block.props.content as string) || ''}
						onChange={handleChange}
						onComplete={handleComplete}
						multiline={false}
					/>
				)}
			</EmailButton>
		</div>
	);
}
