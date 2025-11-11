import { BlockRendererProps } from '../../block-renderer';

export function DividerBlock({
	block,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	return (
		<div
			{...interactionProps}
			style={styles}
			data-block-type='Divider'
			data-block-id={block.id}
		>
			<hr
				style={{
					border: 'none',
					borderTop: `${block.props.thickness || 1}px ${block.props.style || 'solid'} ${block.props.color || '#DDDDDD'}`,
					width:
						typeof block.props.width === 'string' ? block.props.width : '100%',
					margin: 0,
				}}
			/>
		</div>
	);
}
