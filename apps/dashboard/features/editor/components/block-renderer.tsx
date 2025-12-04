import { useDraggable } from '@dnd-kit/core';
import type { BlockIR } from '@requil/types';
import React from 'react';
import { cn } from '@/lib/utils';
import { BlockActions } from './block-actions';
import { ContainerBlock, RootBlock, SectionBlock } from './blocks/layout';
import { DropZone } from './drop-zone';

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
					isSelected && 'outline outline-2 outline-primary -outline-offset-2',
					isHovered && 'outline outline-1 outline-primary/50 -outline-offset-1',
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

	const commonBlockProps = {
		block,
		isCanvas,
		viewport,
		onSelect,
		onHover,
		selectedBlockId,
		hoveredBlockId,
		onMoveUp,
		onMoveDown,
		onDelete,
		onSelectParent,
		interactionProps: combinedInteractionProps,
	};

	const blockContent = (() => {
		switch (block.type) {
			case 'Root':
				return <RootBlock {...commonBlockProps} />;
			case 'Container':
				return <ContainerBlock {...commonBlockProps} />;
			case 'Section':
				return <SectionBlock {...commonBlockProps} />;

			default:
				return (
					<div
						{...combinedInteractionProps}
						data-block-type={block.type}
						data-block-id={block.id}
					>
						<div className='p-4 border border-dashed border-gray-300 text-gray-500 text-sm'>
							{block.type}: {block.id}
						</div>
					</div>
				);
		}
	})();

	if (isSelected && block.type !== 'Root' && isCanvas) {
		const canMoveUp = siblingIndex > 0;
		const canMoveDown = siblingIndex < siblingCount - 1;

		return (
			<div style={{ position: 'relative' }}>
				{blockContent}
				<BlockActions
					blockId={block.id}
					onMoveUp={() => onMoveUp?.(block.id)}
					onMoveDown={() => onMoveDown?.(block.id)}
					onDelete={() => onDelete?.(block.id)}
					onSelectParent={() => onSelectParent?.(block.id)}
					canMoveUp={canMoveUp}
					canMoveDown={canMoveDown}
					hasParent={!!parentId}
				/>
			</div>
		);
	}

	return blockContent;
};
