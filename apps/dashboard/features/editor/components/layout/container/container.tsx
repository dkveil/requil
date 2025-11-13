import { BlockRendererProps } from '../../block-renderer';
import { ContainerBlock } from './container-block';

export function Container({
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
			blockType='Container'
			additionalStyles={{
				maxWidth: block.props.fullWidth ? '100%' : `${block.props.maxWidth}px`,
				margin: '0 auto',
			}}
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
