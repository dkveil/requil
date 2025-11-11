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
	const { selectedBlockId, document, addBlock, selectBlock } = useCanvas();
	const t = useTranslations('editor');
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

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

		// Reordering existing blocks
		if (
			active.id !== over.id &&
			typeof active.id === 'string' &&
			active.id.startsWith('block-')
		) {
			toast.info('Block reordering coming soon');
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
				{activeId?.startsWith('sidebar-') ? (
					<div className='p-3 rounded-md border-2 border-primary bg-background shadow-lg flex flex-col items-center justify-center gap-2'>
						<div className='w-12 h-12 rounded border border-dashed border-primary flex items-center justify-center text-primary'>
							<ComponentIcon type={activeId.replace('sidebar-', '')} />
						</div>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
