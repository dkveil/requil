import { BlockRendererProps } from '../../block-renderer';

export function ButtonBlock({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const text = (block.props.text as string) || 'Click Me';
	const href = (block.props.href as string) || '#';

	return (
		<div
			{...interactionProps}
			style={{
				...styles,
				textAlign:
					(block.props.align as 'left' | 'center' | 'right') || 'center',
			}}
			data-block-type='Button'
			data-block-id={block.id}
		>
			<a
				href={isCanvas ? undefined : href}
				onClick={(e) => isCanvas && e.preventDefault()}
				style={{
					display: block.props.fullWidth ? 'block' : 'inline-block',
					backgroundColor: (block.props.backgroundColor as string) || '#3B82F6',
					color: (block.props.textColor as string) || '#FFFFFF',
					fontSize:
						typeof block.props.fontSize === 'number'
							? block.props.fontSize
							: 16,
					fontWeight:
						typeof block.props.fontWeight === 'string'
							? block.props.fontWeight
							: '600',
					borderRadius:
						typeof block.props.borderRadius === 'number'
							? block.props.borderRadius
							: 4,
					paddingTop:
						typeof block.props.paddingTop === 'number'
							? block.props.paddingTop
							: 12,
					paddingBottom:
						typeof block.props.paddingBottom === 'number'
							? block.props.paddingBottom
							: 12,
					paddingLeft:
						typeof block.props.paddingLeft === 'number'
							? block.props.paddingLeft
							: 24,
					paddingRight:
						typeof block.props.paddingRight === 'number'
							? block.props.paddingRight
							: 24,
					textDecoration: 'none',
					cursor: 'pointer',
				}}
			>
				{text}
			</a>
		</div>
	);
}
