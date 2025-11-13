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
			}}
			data-block-type='Text'
			data-block-id={block.id}
		>
			{content}
		</div>
	);
}
