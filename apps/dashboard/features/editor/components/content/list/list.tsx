import { BlockRendererProps } from '../../block-renderer';

interface ListItem {
	id: string;
	text: string;
}

function getListStyleType(
	listType: 'bullet' | 'numbered' | 'custom',
	showMarkers: boolean
): string {
	if (listType === 'custom' || !showMarkers) return 'none';
	return listType === 'numbered' ? 'decimal' : 'disc';
}

function getListTag(listType: 'bullet' | 'numbered' | 'custom'): 'ol' | 'ul' {
	return listType === 'numbered' ? 'ol' : 'ul';
}

function hasVisibleMarkers(
	listType: 'bullet' | 'numbered' | 'custom',
	showMarkers: boolean
): boolean {
	return (listType !== 'custom' && showMarkers) || listType === 'custom';
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
	const listType =
		(block.props.listType as 'bullet' | 'numbered' | 'custom') || 'bullet';
	const showMarkers = (block.props.showMarkers as boolean) ?? true;
	const markerColor = (block.props.markerColor as string) || 'inherit';
	const customMarker = (block.props.customMarker as string) || '→';
	const customMarkerColor =
		(block.props.customMarkerColor as string) || '#000000';
	const gap = (block.props.gap as number) ?? 0;

	const listStyleType = getListStyleType(listType, showMarkers);
	const showMarkerPadding = hasVisibleMarkers(listType, showMarkers);
	const ListTag = getListTag(listType);

	const existingPaddingLeft =
		typeof styles.paddingLeft === 'number'
			? styles.paddingLeft
			: typeof styles.paddingLeft === 'string'
				? parseInt(styles.paddingLeft, 10) || 0
				: 0;

	const listStyles: React.CSSProperties = {
		...styles,
		margin: 0,
		paddingLeft: showMarkerPadding
			? existingPaddingLeft + 20
			: existingPaddingLeft,
		listStylePosition: 'outside',
		listStyleType,
		display: 'flex',
		flexDirection: 'column',
		gap: gap > 0 ? `${gap}px` : undefined,
	};

	if (showMarkers && markerColor !== 'inherit' && listType !== 'custom') {
		listStyles.color = markerColor;
	}

	return (
		<div
			{...interactionProps}
			data-block-type='List'
			data-block-id={block.id}
		>
			<ListTag style={listStyles}>
				{items.map((item, index) => {
					const liStyles: React.CSSProperties = {};

					if (
						showMarkers &&
						markerColor !== 'inherit' &&
						listType !== 'custom'
					) {
						liStyles.color = styles.color || 'inherit';
					}

					if (listType === 'custom') {
						return (
							<li
								key={item.id || index}
								style={liStyles}
							>
								<span
									style={{
										color: customMarkerColor,
										marginRight: '8px',
										userSelect: 'none',
									}}
								>
									{customMarker}
								</span>
								<span>{item.text}</span>
							</li>
						);
					}

					return (
						<li
							key={item.id || index}
							style={liStyles}
						>
							{item.text}
						</li>
					);
				})}
			</ListTag>
		</div>
	);
}
