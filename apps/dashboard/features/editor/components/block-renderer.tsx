import { useDraggable } from '@dnd-kit/core';
import type { BlockIR } from '@requil/types';
import React from 'react';
import { cn } from '@/lib/utils';
import { convertPropsToStyles } from '../lib/props-to-styles';
import { BlockActions } from './block-actions';
import { Button as ButtonBlock } from './content/button/button';
import { Heading as HeadingBlock } from './content/heading/heading';
import { Image as ImageBlock } from './content/image/image';
import { List as ListBlock } from './content/list/list';
import { Quote as QuoteBlock } from './content/quote/quote';
import { SocialIcons as SocialIconsBlock } from './content/social-icons/social-icons';
import { Text as TextBlock } from './content/text/text';
import { DropZone } from './drop-zone';
import { Block } from './layout/block/block';
import { Column as ColumnBlock } from './layout/column/column';
import { Columns as ColumnsBlock } from './layout/columns/columns';
import { Container as ContainerBlock } from './layout/container/container';
import { Divider as DividerBlock } from './layout/divider/divider';
import { Root as RootBlock } from './layout/root/root';
import { Spacer as SpacerBlock } from './layout/spacer/spacer';

export interface BlockRendererProps {
	block: BlockIR;
	isCanvas?: boolean;
	viewport?: 'desktop' | 'mobile';
	isStacked?: boolean;
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
	parentHasLink?: boolean;
}

// Helper function to render children with drop zones
export function renderChildrenWithDropZones(
	block: BlockIR,
	isCanvas = true,
	viewport?: 'desktop' | 'mobile',
	onSelect?: (blockId: string) => void,
	onHover?: (blockId: string | null) => void,
	selectedBlockId?: string | null,
	hoveredBlockId?: string | null,
	onMoveUp?: (blockId: string) => void,
	onMoveDown?: (blockId: string) => void,
	onDelete?: (blockId: string) => void,
	onSelectParent?: (blockId: string) => void,
	parentHasLink?: boolean
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
						viewport={viewport}
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
						parentHasLink={parentHasLink}
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
	viewport = 'desktop',
	isStacked = false,
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

	const commonBlockProps = {
		block,
		isCanvas,
		viewport,
		isStacked,
		styles,
		interactionProps: combinedInteractionProps,
		onSelect,
		onHover,
		selectedBlockId,
		hoveredBlockId,
		onSelectParent,
		onMoveUp,
		onMoveDown,
		onDelete,
	};

	const blockContent = (() => {
		switch (block.type) {
			case 'Root':
				return <RootBlock {...commonBlockProps} />;

			case 'Container':
				return <ContainerBlock {...commonBlockProps} />;

			case 'Block':
				return <Block {...commonBlockProps} />;

			case 'Columns':
				return <ColumnsBlock {...commonBlockProps} />;

			case 'Column':
				return <ColumnBlock {...commonBlockProps} />;

			case 'Spacer':
				return <SpacerBlock {...commonBlockProps} />;

			case 'Divider':
				return <DividerBlock {...commonBlockProps} />;

			case 'Text':
				return <TextBlock {...commonBlockProps} />;

			case 'Heading':
				return <HeadingBlock {...commonBlockProps} />;

			case 'Button':
				return <ButtonBlock {...commonBlockProps} />;

			case 'Image':
				return <ImageBlock {...commonBlockProps} />;

			case 'List':
				return <ListBlock {...commonBlockProps} />;

			case 'Quote':
				return <QuoteBlock {...commonBlockProps} />;

			case 'SocialIcons':
				return <SocialIconsBlock {...commonBlockProps} />;

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
			(typeof block.props.width === 'string' &&
				block.props.width.includes('%'));

		const isStackedColumn = isStacked && block.type === 'Column';

		let wrapperClassName = 'block-wrapper-other';
		wrapperClassName = isBlockWithWidth
			? 'block-wrapper-column-explicit'
			: 'block-wrapper-column-flex';

		return (
			<div
				className={wrapperClassName}
				style={{
					position: 'relative',
					width: isStackedColumn
						? '100%'
						: isBlockWithWidth
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
