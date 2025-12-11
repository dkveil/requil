import type { BlockIR } from '@requil/types';
import React from 'react';
import { BlockRenderer } from './block-renderer';
import { DropZone } from './drop-zone';

export type RenderChildrenProps = {
	block: BlockIR;
	isCanvas?: boolean;
	viewport?: 'desktop' | 'mobile';
	onSelect?: (blockId: string) => void;
	onHover?: (blockId: string | null) => void;
	selectedBlockId?: string | null;
	hoveredBlockId?: string | null;
	onMoveUp?: (blockId: string) => void;
	onMoveDown?: (blockId: string) => void;
	onDelete?: (blockId: string) => void;
	onSelectParent?: (blockId: string) => void;
	interactionProps?: React.HTMLAttributes<HTMLDivElement>;
};

export function RenderChildren({
	block,
	isCanvas = true,
	viewport,
	onSelect,
	onHover,
	selectedBlockId,
	hoveredBlockId,
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
}: RenderChildrenProps) {
	const children = block.children || [];

	return (
		<>
			{isCanvas && (
				<DropZone
					id={`dropzone-${block.id}-0`}
					parentId={block.id}
					position={0}
					fullHeight={children.length === 0}
				/>
			)}

			{children.map((child: BlockIR, index: number) => (
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
