'use client';

import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import type { Block } from '@requil/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Canvas } from '../components/canvas';
import { ComponentIcon } from '../components/component-icon';
import { useCanvas } from '../hooks/use-canvas';
import { createBlock } from '../lib/block-factory';
import EditorHeader from './editor-header';
import { ElementsSidebar } from './elements-sidebar';
import { SettingsSidebar } from './settings-sidebar';

export default function EditorLayout() {
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
		block: Block | undefined,
		blockId: string
	): Block | null => {
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

	const hasDescendant = (block: Block, blockId: string): boolean => {
		if (block.id === blockId) return true;
		if (!block.children) return false;
		return block.children.some((child) => hasDescendant(child, blockId));
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
		};

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
					if (!isDescendantOrSelf(activeData.blockId, overData.parentId)) {
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
				<div className='flex h-full'>
					<ElementsSidebar onAddBlock={handleAddBlock} />
					<div className='flex-1'>
						<Canvas />
					</div>
					<SettingsSidebar />
				</div>
			</div>
			<DragOverlay>
				{activeId ? (
					<div className='p-3 rounded-md border-2 border-primary bg-background shadow-lg opacity-90'>
						{activeId.startsWith('sidebar-') ? (
							<div className='w-12 h-12 rounded border border-dashed border-primary flex items-center justify-center text-primary'>
								<ComponentIcon type={activeId.replace('sidebar-', '')} />
							</div>
						) : activeId.startsWith('canvas-block-') ? (
							<div className='px-4 py-2 text-sm font-medium text-primary'>
								Moving block...
							</div>
						) : null}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
