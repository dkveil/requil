import { BlockRendererProps } from '../block-renderer';
import { ContainerBlock } from './container';

export function ColumnBlock({
	block,
	isCanvas,
	styles,
	interactionProps,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
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
				minWidth: 0, // Prevent flex overflow
			}}
			emptyMessage='Empty Column'
			onSelect={onSelect}
			onHover={onHover}
			selectedBlockId={selectedBlockId}
			hoveredBlockId={hoveredBlockId}
		/>
	);
}
