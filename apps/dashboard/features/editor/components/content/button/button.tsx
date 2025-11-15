import { BlockRendererProps } from '../../block-renderer';

export function Button({
	block,
	isCanvas,
	styles,
	interactionProps,
	parentHasLink,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const text = (block.props.text as string) || 'Click Me';
	const action = (block.props.action as string) || 'link';
	const href = (block.props.href as string) || '#';

	const shouldRenderAsLink = action === 'link' && !parentHasLink;
	const Tag = shouldRenderAsLink ? 'a' : 'span';

	const {
		padding,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		width,
		backgroundColor,
		...wrapperStyles
	} = styles;

	const buttonStyles: React.CSSProperties = {
		...styles,
		display: 'inline-block',
		backgroundColor,
		textDecoration: 'none',
		cursor: 'pointer',
		textAlign: 'center',
	};

	return (
		<div
			{...interactionProps}
			style={wrapperStyles}
			data-block-id={block.id}
			data-block-type='Button'
		>
			<Tag
				{...(shouldRenderAsLink
					? {
							href: isCanvas ? undefined : href,
							onClick: (e: React.MouseEvent) => isCanvas && e.preventDefault(),
						}
					: {})}
				style={buttonStyles}
			>
				{text}
			</Tag>
		</div>
	);
}
