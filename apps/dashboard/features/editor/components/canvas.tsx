'use client';

import { useEffect } from 'react';
import { useCanvas, useCanvasKeyboardShortcuts } from '../hooks/use-canvas';
import { createDefaultDocument } from '../lib/block-factory';
import { BlockRenderer } from './block-renderer';

export function Canvas() {
	const {
		document,
		selectedBlockId,
		hoveredBlockId,
		viewport,
		zoom,
		setDocument,
		selectBlock,
		hoverBlock,
		moveBlockUp,
		moveBlockDown,
		removeBlock,
		selectParentBlock,
	} = useCanvas();

	// Initialize keyboard shortcuts
	useCanvasKeyboardShortcuts();

	// Initialize document on mount
	useEffect(() => {
		if (!document) {
			setDocument(createDefaultDocument());
		}
	}, [document, setDocument]);

	if (!document) {
		return (
			<div className='h-full flex items-center justify-center bg-muted'>
				<p className='text-muted-foreground'>Loading canvas...</p>
			</div>
		);
	}

	const handleCanvasClick = (e: React.MouseEvent) => {
		// Only deselect if clicking on the canvas background (not on a block)
		const target = e.target as HTMLElement;
		if (target.classList.contains('canvas-wrapper')) {
			selectBlock(null);
		}
	};

	return (
		<div className='h-full flex flex-col bg-background'>
			<div
				onClick={handleCanvasClick}
				className='flex-1 overflow-auto bg-muted p-8 canvas-wrapper'
			>
				<div
					style={{
						transform: `scale(${zoom})`,
						transformOrigin: 'top center',
						maxWidth: viewport === 'mobile' ? '375px' : '100%',
						margin: '0 auto',
					}}
				>
					<BlockRenderer
						block={document.root}
						isCanvas={true}
						onSelect={selectBlock}
						onHover={hoverBlock}
						selectedBlockId={selectedBlockId}
						hoveredBlockId={hoveredBlockId}
						onMoveUp={moveBlockUp}
						onMoveDown={moveBlockDown}
						onDelete={removeBlock}
						onSelectParent={selectParentBlock}
						parentId={null}
					/>
				</div>
			</div>
		</div>
	);
}
