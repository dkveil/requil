import { useCanvas } from '../../../hooks/use-canvas';
import { BlockRendererProps } from '../../block-renderer';
import { InlineTextEditor } from '../../inline-text-editor';

export function Heading({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const content = (block.props.content as string) || 'Your Heading';
	const level =
		(block.props.level as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') || 'h2';
	const Tag = level;
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
			<Tag
				onClick={handleEditingClick}
				onMouseDown={handleEditingClick}
				style={{
					...styles,
					margin: 0,
				}}
				data-block-type='Heading'
				data-block-id={block.id}
			>
				<InlineTextEditor
					value={content}
					onChange={handleChange}
					onComplete={handleComplete}
					multiline={false}
					style={{
						...styles,
						margin: 0,
					}}
					placeholder='Your Heading'
				/>
			</Tag>
		);
	}

	return (
		<Tag
			{...interactionProps}
			onDoubleClick={handleDoubleClick}
			style={{
				...styles,
				margin: 0,
			}}
			data-block-type='Heading'
			data-block-id={block.id}
		>
			{content}
		</Tag>
	);
}
