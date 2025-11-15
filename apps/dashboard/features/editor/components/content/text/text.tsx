import { useCanvas } from '../../../hooks/use-canvas';
import { BlockRendererProps } from '../../block-renderer';
import { InlineTextEditor } from '../../inline-text-editor';

export function Text({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const content = (block.props.content as string) || 'Enter your text here...';
	const { editingBlockId, updateBlock, stopEditing, startEditing } =
		useCanvas();
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

	const handleEditingClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	if (isEditing) {
		return (
			<div
				onClick={handleEditingClick}
				onMouseDown={handleEditingClick}
				style={{
					...styles,
				}}
				data-block-type='Text'
				data-block-id={block.id}
			>
				<InlineTextEditor
					value={content}
					onChange={handleChange}
					onComplete={handleComplete}
					multiline={true}
					style={{
						...styles,
						width: '100%',
					}}
					placeholder='Enter your text here...'
				/>
			</div>
		);
	}

	return (
		<div
			{...interactionProps}
			onDoubleClick={handleDoubleClick}
			style={{
				...styles,
			}}
			data-block-type='Text'
			data-block-id={block.id}
		>
			{content}
		</div>
	);
}
