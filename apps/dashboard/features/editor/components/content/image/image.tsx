import { BlockRendererProps } from '../../block-renderer';

export function Image({
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
	const linkTo = block.props.linkTo as
		| { href?: string; target?: boolean }
		| null
		| undefined;
	const hasLink = linkTo?.href && !isCanvas;

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
			{hasLink ? (
				<a
					href={linkTo.href}
					target={linkTo.target ? '_blank' : undefined}
					rel={linkTo.target ? 'noopener noreferrer' : undefined}
				>
					{imageElement}
				</a>
			) : (
				imageElement
			)}
		</div>
	);
}
