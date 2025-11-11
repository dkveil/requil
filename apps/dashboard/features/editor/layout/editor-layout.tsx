'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Canvas } from '../components/canvas';
import { useCanvas } from '../hooks/use-canvas';
import { createBlock } from '../lib/block-factory';
import EditorHeader from './editor-header';
import { ElementsSidebar } from './elements-sidebar';
import { SettingsSidebar } from './settings-sidebar';

export default function EditorLayout() {
	const { selectedBlockId, document, addBlock, selectBlock } = useCanvas();
	const t = useTranslations('editor');

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
	);
}
