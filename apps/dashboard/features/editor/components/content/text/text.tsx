import { BlockRendererProps } from '../../block-renderer';

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

	return (
		<div
			{...interactionProps}
			style={{
				...styles,
				fontSize:
					typeof block.props.fontSize === 'number' ? block.props.fontSize : 14,
				fontWeight:
					typeof block.props.fontWeight === 'string'
						? block.props.fontWeight
						: 'normal',
				color:
					typeof block.props.color === 'string' ? block.props.color : '#000000',
				textAlign:
					(block.props.textAlign as 'left' | 'center' | 'right' | 'justify') ||
					'left',
				lineHeight:
					typeof block.props.lineHeight === 'number'
						? block.props.lineHeight
						: 1.5,
				fontFamily: (block.props.fontFamily as string) || 'Arial, sans-serif',
			}}
			data-block-type='Text'
			data-block-id={block.id}
		>
			{content}
		</div>
	);
}
