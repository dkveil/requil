import { BlockRendererProps } from '../../block-renderer';

export function Spacer({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	return (
		<div
			{...interactionProps}
			style={{
				...styles,
				height:
					typeof block.props.height === 'number' ? block.props.height : 20,
				minHeight:
					typeof block.props.height === 'number' ? block.props.height : 20,
			}}
			data-block-type='Spacer'
			data-block-id={block.id}
		>
			{isCanvas && (
				<div className='h-full border border-dashed border-gray-300 flex items-center justify-center'>
					<span className='text-xs text-gray-400'>
						{typeof block.props.height === 'number'
							? `${block.props.height}px`
							: '20px'}
					</span>
				</div>
			)}
		</div>
	);
}
