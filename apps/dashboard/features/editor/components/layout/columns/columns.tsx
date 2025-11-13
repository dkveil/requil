import { BlockRenderer, BlockRendererProps } from '../../block-renderer';

export function Columns({
	block,
	isCanvas,
	viewport = 'desktop',
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
	const isMobile = viewport === 'mobile';
	const shouldStack = isMobile && block.props.stackOnMobile !== false;

	return (
		<div
			{...interactionProps}
			style={{
				...styles,
				display: 'flex',
				flexDirection: shouldStack ? 'column' : 'row',
				gap: typeof block.props.gap === 'number' ? block.props.gap : 0,
				alignItems:
					block.props.verticalAlign === 'middle'
						? 'center'
						: block.props.verticalAlign === 'bottom'
							? 'flex-end'
							: 'flex-start',
			}}
			data-block-type='Columns'
			data-block-id={block.id}
		>
			{block.children?.map((child) => (
				<BlockRenderer
					key={child.id}
					block={child}
					isCanvas={isCanvas}
					viewport={viewport}
					isStacked={shouldStack}
					onSelect={onSelect}
					onHover={onHover}
					selectedBlockId={selectedBlockId}
					hoveredBlockId={hoveredBlockId}
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onDelete={onDelete}
					onSelectParent={onSelectParent}
					parentId={block.id}
				/>
			))}
		</div>
	);
}
