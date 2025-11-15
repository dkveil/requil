import { BlockRendererProps } from '../../block-renderer';

export function Quote({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const text = (block.props.text as string) || 'This is a quote.';
	const citation = block.props.citation as string;

	return (
		<div
			{...interactionProps}
			style={styles}
			data-block-id={block.id}
			data-block-type='Quote'
		>
			<blockquote
				style={{
					margin: 0,
					padding: 0,
				}}
			>
				<p
					style={{
						margin: 0,
					}}
				>
					{text}
				</p>
				{citation && (
					<footer
						style={{
							marginTop: '8px',
							fontSize: '0.875em',
							opacity: 0.8,
						}}
					>
						— {citation}
					</footer>
				)}
			</blockquote>
		</div>
	);
}
