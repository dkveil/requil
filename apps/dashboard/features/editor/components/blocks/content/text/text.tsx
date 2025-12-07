import { useDroppable } from '@dnd-kit/core';
import { EmailText } from '@requil/email-engine';
import { replaceVariables } from '@requil/email-engine/';
import { useCanvas } from '@/features/editor/hooks/use-canvas';
import { cn } from '@/lib/utils';
import { InlineTextEditor } from '../../../inline-text-editor';
import { RenderChildrenProps } from '../../../render-children';

export type TextBlockProps = RenderChildrenProps;

export function TextBlock({
	block,
	isCanvas = false,
	interactionProps,
}: TextBlockProps) {
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
			data-block-type='Text'
			data-block-id={block.id}
			style={{
				position: isCanvas ? 'relative' : undefined,
			}}
			onDoubleClick={handleDoubleClick}
		>
			{isEditing ? (
				<EmailText block={block}>
					<InlineTextEditor
						value={block.props.content as string}
						onChange={handleChange}
						onComplete={handleComplete}
						multiline={true}
						className='min-h-[1em]'
					/>
				</EmailText>
			) : (
				<EmailText
					block={block}
					canvasContent={displayContent}
				/>
			)}
		</div>
	);
}
