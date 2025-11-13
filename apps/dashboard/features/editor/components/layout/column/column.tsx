import { BlockRendererProps } from '../../block-renderer';
import { ContainerBlock } from '../container/container-block';

export function Column({
	block,
	isCanvas,
	styles,
	interactionProps,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	return (
		<ContainerBlock
			block={block}
			isCanvas={isCanvas}
			styles={styles}
			interactionProps={interactionProps}
			blockType='Column'
			additionalStyles={{
				flex: block.props.width === 'auto' ? 1 : `0 0 ${block.props.width}`,
				minWidth: 0,
			}}
			emptyMessage='Empty Column'
			onSelect={onSelect}
			onHover={onHover}
			selectedBlockId={selectedBlockId}
			hoveredBlockId={hoveredBlockId}
			onMoveUp={onMoveUp}
			onMoveDown={onMoveDown}
			onDelete={onDelete}
			onSelectParent={onSelectParent}
		/>
	);
}
