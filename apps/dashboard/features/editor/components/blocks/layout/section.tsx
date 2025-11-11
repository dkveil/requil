import {
	BlockRendererProps,
	renderChildrenWithDropZones,
} from '../../block-renderer';
import { ContainerBlock } from './container';

export function SectionBlock({
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
			blockType='Section'
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
		/>
	);
}
