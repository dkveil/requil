import { BlockRendererProps } from '../../block-renderer';

interface ListItem {
	id: string;
	text: string;
}

export function List({
	block,
	isCanvas,
	styles,
	interactionProps,
}: BlockRendererProps & {
	styles: React.CSSProperties;
	interactionProps: Record<string, unknown>;
}) {
	const items = (block.props.items as ListItem[]) || [
		{ id: '1', text: 'List item 1' },
		{ id: '2', text: 'List item 2' },
		{ id: '3', text: 'List item 3' },
	];
	const listType = (block.props.listType as 'bullet' | 'numbered') || 'bullet';
	const indent = (block.props.indent as number) || 0;

	const ListTag = listType === 'numbered' ? 'ol' : 'ul';

	return (
		<div
			{...interactionProps}
			style={{
				...styles,
			}}
			data-block-type='List'
			data-block-id={block.id}
		>
			<ListTag
				style={{
					margin: 0,
					paddingLeft: `${20 + indent}px`,
					listStylePosition: 'outside',
				}}
			>
				{items.map((item, index) => (
					<li
						key={item.id || index}
						style={{
							marginBottom: index < items.length - 1 ? '8px' : 0,
						}}
					>
						{item.text}
					</li>
				))}
			</ListTag>
		</div>
	);
}
