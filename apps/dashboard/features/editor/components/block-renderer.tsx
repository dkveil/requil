import { useDraggable } from '@dnd-kit/core';
import type { Block } from '@requil/types';
import React from 'react';
import { cn } from '@/lib/utils';
import { BlockActions } from './block-actions';
import {
	ButtonBlock,
	ColumnBlock,
	ColumnsBlock,
	ContainerBlock,
	DividerBlock,
	HeadingBlock,
	ImageBlock,
	RootBlock,
	SectionBlock,
	SpacerBlock,
	TextBlock,
} from './blocks';
import { DropZone } from './drop-zone';

export interface BlockRendererProps {
	block: Block;
	isCanvas?: boolean; // true = editor mode, false = preview mode
	onSelect?: (blockId: string) => void;
	onHover?: (blockId: string | null) => void;
	selectedBlockId?: string | null;
	hoveredBlockId?: string | null;
	onMoveUp?: (blockId: string) => void;
	onMoveDown?: (blockId: string) => void;
	onDelete?: (blockId: string) => void;
	onSelectParent?: (blockId: string) => void;
	parentId?: string | null;
	siblingIndex?: number;
	siblingCount?: number;
}

// Helper function to render children with drop zones
export function renderChildrenWithDropZones(
	block: Block,
	isCanvas = true,
	onSelect?: (blockId: string) => void,
	onHover?: (blockId: string | null) => void,
	selectedBlockId?: string | null,
	hoveredBlockId?: string | null,
	onMoveUp?: (blockId: string) => void,
	onMoveDown?: (blockId: string) => void,
	onDelete?: (blockId: string) => void,
	onSelectParent?: (blockId: string) => void
) {
	const children = block.children || [];

	return (
		<>
			{isCanvas && (
				<DropZone
					id={`dropzone-${block.id}-0`}
					parentId={block.id}
					position={0}
				/>
			)}

			{children.map((child, index) => (
				<React.Fragment key={child.id}>
					<BlockRenderer
						block={child}
						isCanvas={isCanvas}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
						onSelectParent={onSelectParent}
						parentId={block.id}
						siblingIndex={index}
						siblingCount={children.length}
					/>
					{isCanvas && (
						<DropZone
							id={`dropzone-${block.id}-${index + 1}`}
							parentId={block.id}
							position={index + 1}
						/>
					)}
				</React.Fragment>
			))}
		</>
	);
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
	block,
	isCanvas = true,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
	parentId,
	siblingIndex = 0,
	siblingCount = 1,
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

	const {
		attributes,
		listeners,
		setNodeRef: setDragNodeRef,
		isDragging,
	} = useDraggable({
		id: `canvas-block-${block.id}`,
		data: {
			type: 'canvas-block',
			blockId: block.id,
			blockType: block.type,
		},
		disabled: !isCanvas || block.type === 'Root',
	});

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

	const combinedInteractionProps =
		isCanvas && block.type !== 'Root'
			? {
					...interactionProps,
					...listeners,
					...attributes,
					ref: setDragNodeRef,
					className: cn(
						(interactionProps as { className?: string }).className,
						isDragging && 'opacity-50'
					),
					style: {
						...((interactionProps as { style?: React.CSSProperties }).style ||
							{}),
						cursor: isDragging ? 'grabbing' : 'grab',
					},
				}
			: interactionProps;

	// Calculate if block can move up/down
	// This would require parent's children info, which we'll compute when needed
	// For now, we'll pass the handlers and let BlockActions determine if enabled

	const blockContent = (() => {
		switch (block.type) {
			case 'Root':
				return (
					<RootBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Container':
				return (
					<ContainerBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						blockType='Container'
						additionalStyles={{
							maxWidth: (block.props.maxWidth as number | undefined) || 600,
							width: block.props.fullWidth ? '100%' : 'auto',
							margin: '0 auto',
						}}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Section':
				return (
					<SectionBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Columns':
				return (
					<ColumnsBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Column':
				return (
					<ColumnBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Spacer':
				return (
					<SpacerBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Divider':
				return (
					<DividerBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Text':
				return (
					<TextBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Heading':
				return (
					<HeadingBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Button':
				return (
					<ButtonBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
				);

			case 'Image':
				return (
					<ImageBlock
						block={block}
						isCanvas={isCanvas}
						styles={styles}
						interactionProps={combinedInteractionProps}
						onSelect={onSelect}
						onHover={onHover}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onSelectParent={onSelectParent}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDelete={onDelete}
					/>
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
	})();

	if (isSelected && block.type !== 'Root' && isCanvas) {
		const canMoveUp = siblingIndex > 0;
		const canMoveDown = siblingIndex < siblingCount - 1;

		const isBlockWithWidth =
			typeof block.props.width === 'number' ||
			typeof block.props.width === 'string';

		let wrapperClassName = 'block-wrapper-other';
		wrapperClassName = isBlockWithWidth
			? 'block-wrapper-column-explicit'
			: 'block-wrapper-column-flex';

		return (
			<div
				className={wrapperClassName}
				style={{
					position: 'relative',
					width: isBlockWithWidth
						? (block.props.width as string | number)
						: 'auto',
				}}
			>
				{blockContent}
				<BlockActions
					blockId={block.id}
					onMoveUp={() => {
						onMoveUp?.(block.id);
					}}
					onMoveDown={() => {
						onMoveDown?.(block.id);
					}}
					onDelete={() => {
						onDelete?.(block.id);
					}}
					onSelectParent={() => {
						onSelectParent?.(block.id);
					}}
					canMoveUp={canMoveUp}
					canMoveDown={canMoveDown}
					hasParent={!!parentId}
				/>
			</div>
		);
	}

	return blockContent;
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
