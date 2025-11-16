'use client';

import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	type Modifier,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import type { BlockIR } from '@requil/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Canvas } from '../components/canvas';
import { ComponentIcon } from '../components/component-icon';
import { DevInfoBanner } from '../components/dev-info-banner';
import { useCanvas } from '../hooks/use-canvas';
import { createBlock } from '../lib/block-factory';
import EditorHeader from './editor-header';
import { ElementsSidebar } from './elements-sidebar';
import { SettingsSidebar } from './settings-sidebar';

// Custom modifier to position overlay at exact cursor position (pointer tip)
const cursorOffsetModifier: Modifier = ({
	activatorEvent,
	draggingNodeRect,
	transform,
}) => {
	if (draggingNodeRect && activatorEvent) {
		// Check if it's a pointer/mouse event
		if ('clientX' in activatorEvent && 'clientY' in activatorEvent) {
			const pointerEvent = activatorEvent as PointerEvent | MouseEvent;

			// Calculate offset from dragging node to cursor position
			const offsetX = pointerEvent.clientX - draggingNodeRect.left;
			const offsetY = pointerEvent.clientY - draggingNodeRect.top;

			return {
				...transform,
				x: transform.x + offsetX - draggingNodeRect.width / 2,
				y: transform.y + offsetY - draggingNodeRect.height / 2,
			};
		}
	}

	return transform;
};

interface EditorLayoutProps {
	workspaceId: string;
}

export default function EditorLayout({ workspaceId }: EditorLayoutProps) {
	const { selectedBlockId, document, addBlock, selectBlock, moveBlock } =
		useCanvas();
	const t = useTranslations('editor');
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	// Helper functions - inside component to access document from state
	const findBlockById = (
		block: BlockIR | undefined,
		blockId: string
	): BlockIR | null => {
		if (!block) return null;
		if (block.id === blockId) return block;
		if (block.children) {
			for (const child of block.children) {
				const found = findBlockById(child, blockId);
				if (found) return found;
			}
		}
		return null;
	};

	const hasDescendant = (block: BlockIR, blockId: string): boolean => {
		if (block.id === blockId) return true;
		if (!block.children) return false;
		return block.children.some((child) =>
			hasDescendant(child as BlockIR, blockId)
		);
	};

	// Check if targetId is a descendant of blockId (or the same block)
	// Returns true if we should BLOCK the operation
	const isDescendantOrSelf = (blockId: string, targetId: string): boolean => {
		if (blockId === targetId) return true; // Can't drop block into itself
		const block = findBlockById(document?.root, blockId);
		if (!block) return false;
		return hasDescendant(block, targetId); // Check if targetId is inside blockId
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

		const activeData = active.data.current as {
			type: string;
			blockId?: string;
			blockType?: string;
			assetId?: string;
			assetType?: string;
			publicUrl?: string;
			alt?: string;
		};

		// Handle dragging an asset from assets panel
		if (typeof active.id === 'string' && active.id.startsWith('asset-')) {
			if (activeData?.type === 'asset' && activeData.assetType === 'image') {
				const newBlock = createBlock('Image');
				if (!newBlock) {
					toast.error(t('failedToCreateBlock'));
					return;
				}

				newBlock.props = {
					...newBlock.props,
					src: activeData.publicUrl || '',
					alt: activeData.alt || 'Image',
				};

				const targetId = over.id as string;

				if (targetId.startsWith('dropzone-')) {
					const overData = over.data.current as {
						type: string;
						parentId: string;
						position: number;
					};

					if (overData?.type === 'drop-zone') {
						addBlock(overData.parentId, newBlock, overData.position);
						toast.success(t('addedBlockToCanvas', { blockType: 'Image' }));
						selectBlock(newBlock.id);
						return;
					}
				}

				if (targetId.startsWith('block-')) {
					const blockId = targetId.replace('block-', '');
					addBlock(blockId, newBlock);
					toast.success(t('addedBlockToSelectedBlock', { blockType: 'Image' }));
					selectBlock(newBlock.id);
					return;
				}
			}
			return;
		}

		// Check if dragging a component type from sidebar
		if (typeof active.id === 'string' && active.id.startsWith('sidebar-')) {
			const componentType = active.id.replace('sidebar-', '');
			const newBlock = createBlock(componentType);

			if (!newBlock) {
				toast.error(t('failedToCreateBlock'));
				return;
			}

			const targetId = over.id as string;

			// Check if dropping on a drop zone
			if (targetId.startsWith('dropzone-')) {
				const overData = over.data.current as {
					type: string;
					parentId: string;
					position: number;
				};

				if (overData?.type === 'drop-zone') {
					addBlock(overData.parentId, newBlock, overData.position);
					toast.success(t('addedBlockToCanvas', { blockType: componentType }));
					selectBlock(newBlock.id);
					return;
				}
			}

			// Fallback: drop on block directly
			if (targetId.startsWith('block-')) {
				const blockId = targetId.replace('block-', '');
				addBlock(blockId, newBlock);
				toast.success(
					t('addedBlockToSelectedBlock', { blockType: componentType })
				);
				selectBlock(newBlock.id);
				return;
			}
		}

		// Handle dragging existing blocks (reordering)
		if (activeData?.type === 'canvas-block' && activeData.blockId) {
			const targetId = over.id as string;

			// Drop on drop zone (specific position)
			if (targetId.startsWith('dropzone-')) {
				const overData = over.data.current as {
					type: string;
					parentId: string;
					position: number;
				};

				if (overData?.type === 'drop-zone') {
					// Prevent dropping block into itself or its descendants
					const shouldBlock = isDescendantOrSelf(
						activeData.blockId,
						overData.parentId
					);

					if (!shouldBlock) {
						moveBlock(activeData.blockId, overData.parentId, overData.position);
						toast.success(t('movedBlock'));
					}
					return;
				}
			}

			// Drop on block directly (append as last child)
			if (targetId.startsWith('block-')) {
				const targetBlockId = targetId.replace('block-', '');

				// Prevent dropping block into itself or its descendants
				if (!isDescendantOrSelf(activeData.blockId, targetBlockId)) {
					const targetBlock = findBlockById(document?.root, targetBlockId);
					if (targetBlock) {
						const position = targetBlock.children?.length || 0;
						moveBlock(activeData.blockId, targetBlockId, position);
						toast.success(t('movedBlock'));
					}
				}
				return;
			}
		}
	};

	const handleAddBlock = (blockType: string) => {
		const newBlock = createBlock(blockType);
		if (!newBlock) {
			toast.error(t('failedToCreateBlock'));
			return;
		}

		if (selectedBlockId) {
			addBlock(selectedBlockId, newBlock);
			toast.success(t('addedBlockToSelectedBlock', { blockType }));
		} else if (document) {
			// Add to root if nothing is selected
			addBlock(document.root.id, newBlock);
			toast.success(t('addedBlockToCanvas', { blockType }));
		} else {
			toast.error(t('noDocumentAvailable'));
			return;
		}

		// Auto-select the newly added block
		selectBlock(newBlock.id);
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className='h-screen w-full overflow-hidden bg-background'>
				<EditorHeader />
				<div className='flex h-full flex-col'>
					<div className='flex flex-1'>
						<ElementsSidebar
							onAddBlock={handleAddBlock}
							workspaceId={workspaceId}
						/>
						<div className='flex-1 relative'>
							<Canvas />
							<DevInfoBanner />
						</div>
						<SettingsSidebar workspaceId={workspaceId} />
					</div>
				</div>
			</div>
			<DragOverlay
				modifiers={[cursorOffsetModifier]}
				dropAnimation={{
					duration: 200,
					easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
				}}
			>
				{activeId ? (
					<div className='p-1.5 rounded border border-primary bg-background shadow-md opacity-80'>
						{activeId.startsWith('sidebar-') ? (
							<div className='w-8 h-8 rounded border border-dashed border-primary/60 flex items-center justify-center text-primary'>
								<ComponentIcon
									type={activeId.replace('sidebar-', '')}
									className='w-4 h-4'
								/>
							</div>
						) : activeId.startsWith('canvas-block-') ? (
							<div className='px-2 py-1 text-xs font-medium text-primary'>
								Move
							</div>
						) : null}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
