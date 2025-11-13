import { BlockRendererProps } from '../../block-renderer';
import { ContainerBlock } from '../container/container-block';

export function Block({
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
			blockType='Block'
			additionalStyles={{
				width: block.props.fullWidth ? '100%' : 'auto',
				backgroundImage: block.props.backgroundImage
					? `url(${block.props.backgroundImage})`
					: undefined,
				backgroundSize: block.props.backgroundSize as string,
				backgroundPosition: block.props.backgroundPosition as string,
			}}
			onSelect={onSelect}
			onHover={onHover}
			selectedBlockId={selectedBlockId}
			hoveredBlockId={hoveredBlockId}
			onMoveUp={onMoveUp}
			onMoveDown={onMoveDown}
			onDelete={onDelete}
			onSelectParent={onSelectParent}
			emptyMessage={`Empty ${block.props.htmlTag} block - Drop elements here`}
		/>
	);
}
