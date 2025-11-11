import { BlockRendererProps } from '../../block-renderer';

export function ImageBlock({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const src =
		(block.props.src as string) || 'https://via.placeholder.com/600x300';
	const alt = (block.props.alt as string) || 'Image description';
	const href = block.props.href as string | undefined;

	const imageElement = (
		<img
			src={src}
			alt={alt}
			style={{
				width: (block.props.width as string) || '100%',
				height: 'auto',
				borderRadius:
					typeof block.props.borderRadius === 'number'
						? block.props.borderRadius
						: 0,
				display: 'block',
			}}
		/>
	);

	return (
		<div
			{...interactionProps}
			style={{
				...styles,
				textAlign:
					(block.props.align as 'left' | 'center' | 'right') || 'center',
			}}
			data-block-type='Image'
			data-block-id={block.id}
		>
			{href && !isCanvas ? <a href={href}>{imageElement}</a> : imageElement}
		</div>
	);
}
