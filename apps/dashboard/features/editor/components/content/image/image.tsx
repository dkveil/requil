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

	const {
		padding,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		width,
		...wrapperStyles
	} = styles;

	const imageStyles: React.CSSProperties = {
		...styles,
		width: hasLink ? '100%' : width,
		display: 'block',
	};

	const imageElement = (
		<img
			src={src}
			alt={alt}
			data-block-type='Image'
			style={{
				...imageStyles,
				display: 'block',
			}}
		/>
	);

	return (
		<div
			{...interactionProps}
			style={{
				...wrapperStyles,
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
			data-block-type='Image'
			data-block-id={block.id}
		>
			{hasLink ? (
				<a
					style={{
						...imageStyles,
						display: 'block',
					}}
					href={linkTo.href}
					target={linkTo.target ? '_blank' : undefined}
					rel={linkTo.target ? 'noopener noreferrer' : undefined}
					data-block-type='Image'
				>
					{imageElement}
				</a>
			) : (
				imageElement
			)}
		</div>
	);
}
