import type { Block } from '@requil/types';
import React from 'react';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
	block: Block;
	isCanvas?: boolean; // true = editor mode, false = preview mode
	onSelect?: (blockId: string) => void;
	onHover?: (blockId: string | null) => void;
	selectedBlockId?: string | null;
	hoveredBlockId?: string | null;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
	block,
	isCanvas = true,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
}) => {
	const isSelected = isCanvas && selectedBlockId === block.id;
	const isHovered = isCanvas && hoveredBlockId === block.id && !isSelected;

	const handleClick = (e: React.MouseEvent) => {
		if (isCanvas && onSelect) {
			e.stopPropagation();
			onSelect(block.id);
		}
	};

	const handleMouseEnter = (e: React.MouseEvent) => {
		if (isCanvas && onHover) {
			e.stopPropagation();
			onHover(block.id);
		}
	};

	const handleMouseLeave = () => {
		if (isCanvas && onHover) {
			onHover(null);
		}
	};

	const styles = convertPropsToStyles(block.props);

	const interactionProps = isCanvas
		? {
				onClick: handleClick,
				onMouseEnter: handleMouseEnter,
				onMouseLeave: handleMouseLeave,
				className: cn(
					'transition-all relative',
					isSelected && 'ring-2 ring-blue-500 ring-inset',
					isHovered && 'ring-1 ring-blue-300 ring-inset',
					isCanvas && 'cursor-pointer'
				),
			}
		: {};

	switch (block.type) {
		case 'Container':
			return (
				<div
					{...interactionProps}
					style={{
						...styles,
						maxWidth: (block.props.maxWidth as number | undefined) || 600,
						width: block.props.fullWidth ? '100%' : 'auto',
						margin: '0 auto',
					}}
					data-block-type='Container'
					data-block-id={block.id}
				>
					{block.children?.map((child) => (
						<BlockRenderer
							key={child.id}
							block={child}
							isCanvas={isCanvas}
							onSelect={onSelect}
							onHover={onHover}
							selectedBlockId={selectedBlockId}
							hoveredBlockId={hoveredBlockId}
						/>
					))}
					{isCanvas && (!block.children || block.children.length === 0) && (
						<div className='text-center text-gray-400 py-8 text-sm'>
							Empty Container - Drop elements here
						</div>
					)}
				</div>
			);

		case 'Section':
			return (
				<section
					{...interactionProps}
					style={{
						...styles,
						width: block.props.fullWidth ? '100%' : 'auto',
						backgroundImage: block.props.backgroundImage
							? `url(${block.props.backgroundImage})`
							: undefined,
						backgroundSize: block.props.backgroundSize as string,
						backgroundPosition: block.props.backgroundPosition as string,
					}}
					data-block-type='Section'
					data-block-id={block.id}
				>
					{block.children?.map((child) => (
						<BlockRenderer
							key={child.id}
							block={child}
							isCanvas={isCanvas}
							onSelect={onSelect}
							onHover={onHover}
							selectedBlockId={selectedBlockId}
							hoveredBlockId={hoveredBlockId}
						/>
					))}
					{isCanvas && (!block.children || block.children.length === 0) && (
						<div className='text-center text-gray-400 py-8 text-sm'>
							Empty Section - Drop elements here
						</div>
					)}
				</section>
			);

		case 'Columns':
			return (
				<div
					{...interactionProps}
					style={{
						...styles,
						display: 'flex',
						gap: typeof block.props.gap === 'number' ? block.props.gap : 0,
						alignItems:
							block.props.verticalAlign === 'middle'
								? 'center'
								: block.props.verticalAlign === 'bottom'
									? 'flex-end'
									: 'flex-start',
					}}
					data-block-type='Columns'
					data-block-id={block.id}
				>
					{block.children?.map((child) => (
						<BlockRenderer
							key={child.id}
							block={child}
							isCanvas={isCanvas}
							onSelect={onSelect}
							onHover={onHover}
							selectedBlockId={selectedBlockId}
							hoveredBlockId={hoveredBlockId}
						/>
					))}
				</div>
			);

		case 'Column':
			return (
				<div
					{...interactionProps}
					style={{
						...styles,
						flex: block.props.width === 'auto' ? 1 : `0 0 ${block.props.width}`,
						minWidth: 0, // Prevent flex overflow
					}}
					data-block-type='Column'
					data-block-id={block.id}
				>
					{block.children?.map((child) => (
						<BlockRenderer
							key={child.id}
							block={child}
							isCanvas={isCanvas}
							onSelect={onSelect}
							onHover={onHover}
							selectedBlockId={selectedBlockId}
							hoveredBlockId={hoveredBlockId}
						/>
					))}
					{isCanvas && (!block.children || block.children.length === 0) && (
						<div className='text-center text-gray-400 py-4 text-xs'>
							Empty Column
						</div>
					)}
				</div>
			);

		case 'Spacer':
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

		case 'Divider':
			return (
				<div
					{...interactionProps}
					style={styles}
					data-block-type='Divider'
					data-block-id={block.id}
				>
					<hr
						style={{
							border: 'none',
							borderTop: `${block.props.thickness || 1}px ${block.props.style || 'solid'} ${block.props.color || '#DDDDDD'}`,
							width:
								typeof block.props.width === 'string'
									? block.props.width
									: '100%',
							margin: 0,
						}}
					/>
				</div>
			);

		default:
			return (
				<div
					{...interactionProps}
					className={cn(
						interactionProps.className,
						'border border-red-500 bg-red-50 p-4'
					)}
					data-block-type='Unknown'
					data-block-id={block.id}
				>
					<div className='text-red-600 text-sm'>
						Unknown block type: {block.type}
					</div>
				</div>
			);
	}
};

// Helper function to convert block props to CSS styles
function convertPropsToStyles(
	props: Record<string, unknown>
): React.CSSProperties {
	const styles: React.CSSProperties = {};

	// Padding
	if (typeof props.paddingTop === 'number')
		styles.paddingTop = props.paddingTop;
	if (typeof props.paddingBottom === 'number')
		styles.paddingBottom = props.paddingBottom;
	if (typeof props.paddingLeft === 'number')
		styles.paddingLeft = props.paddingLeft;
	if (typeof props.paddingRight === 'number')
		styles.paddingRight = props.paddingRight;

	// Background
	if (typeof props.backgroundColor === 'string') {
		styles.backgroundColor = props.backgroundColor;
	}

	// Borders
	if (typeof props.borderWidth === 'number') {
		styles.borderWidth = props.borderWidth;
		styles.borderStyle = 'solid';
	}
	if (typeof props.borderColor === 'string')
		styles.borderColor = props.borderColor;
	if (typeof props.borderRadius === 'number')
		styles.borderRadius = props.borderRadius;

	// Dimensions
	if (typeof props.width === 'string' || typeof props.width === 'number') {
		styles.width = props.width;
	}
	if (typeof props.maxWidth === 'number') styles.maxWidth = props.maxWidth;
	if (
		typeof props.minHeight === 'string' ||
		typeof props.minHeight === 'number'
	) {
		styles.minHeight = props.minHeight;
	}

	return styles;
}
