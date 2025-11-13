import { BlockRendererProps } from '../../block-renderer';

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

	return (
		<Tag
			{...interactionProps}
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
