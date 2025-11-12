import React from 'react';
import { useCanvasStore } from '../store/canvas-store';

/**
 * Hook for accessing canvas state and actions
 *
 * @example
 * ```tsx
 * const { document, selectedBlock, selectBlock, updateBlock } = useCanvas();
 * ```
 */
export function useCanvas() {
	const document = useCanvasStore((state) => state.document);
	const selectedBlockId = useCanvasStore((state) => state.selectedBlockId);
	const hoveredBlockId = useCanvasStore((state) => state.hoveredBlockId);
	const viewport = useCanvasStore((state) => state.viewport);
	const zoom = useCanvasStore((state) => state.zoom);
	const isModified = useCanvasStore((state) => state.isModified);

	// Actions
	const setDocument = useCanvasStore((state) => state.setDocument);
	const updateBlock = useCanvasStore((state) => state.updateBlock);
	const addBlock = useCanvasStore((state) => state.addBlock);
	const removeBlock = useCanvasStore((state) => state.removeBlock);
	const moveBlock = useCanvasStore((state) => state.moveBlock);
	const moveBlockUp = useCanvasStore((state) => state.moveBlockUp);
	const moveBlockDown = useCanvasStore((state) => state.moveBlockDown);
	const selectParentBlock = useCanvasStore((state) => state.selectParentBlock);
	const duplicateBlock = useCanvasStore((state) => state.duplicateBlock);

	const undo = useCanvasStore((state) => state.undo);
	const redo = useCanvasStore((state) => state.redo);
	const canUndo = useCanvasStore((state) => state.canUndo);
	const canRedo = useCanvasStore((state) => state.canRedo);

	const selectBlock = useCanvasStore((state) => state.selectBlock);
	const hoverBlock = useCanvasStore((state) => state.hoverBlock);
	const getSelectedBlock = useCanvasStore((state) => state.getSelectedBlock);

	const startDrag = useCanvasStore((state) => state.startDrag);
	const endDrag = useCanvasStore((state) => state.endDrag);
	const setDropTarget = useCanvasStore((state) => state.setDropTarget);

	const setViewport = useCanvasStore((state) => state.setViewport);
	const setZoom = useCanvasStore((state) => state.setZoom);

	const markAsModified = useCanvasStore((state) => state.markAsModified);
	const markAsSaved = useCanvasStore((state) => state.markAsSaved);
	const reset = useCanvasStore((state) => state.reset);

	// Computed values
	const selectedBlock = getSelectedBlock();

	return {
		// State
		document,
		selectedBlockId,
		selectedBlock,
		hoveredBlockId,
		viewport,
		zoom,
		isModified,

		// Document actions
		setDocument,
		updateBlock,
		addBlock,
		removeBlock,
		moveBlock,
		moveBlockUp,
		moveBlockDown,
		selectParentBlock,
		duplicateBlock,

		// History
		undo,
		redo,
		canUndo: canUndo(),
		canRedo: canRedo(),

		// Selection
		selectBlock,
		hoverBlock,

		// Drag & Drop
		startDrag,
		endDrag,
		setDropTarget,

		// UI
		setViewport,
		setZoom,

		// Utility
		markAsModified,
		markAsSaved,
		reset,
	};
}

/**
 * Hook for keyboard shortcuts
 *
 * @example
 * ```tsx
 * useCanvasKeyboardShortcuts();
 * ```
 */
export function useCanvasKeyboardShortcuts() {
	const undo = useCanvasStore((state) => state.undo);
	const redo = useCanvasStore((state) => state.redo);
	const canUndo = useCanvasStore((state) => state.canUndo);
	const canRedo = useCanvasStore((state) => state.canRedo);
	const removeBlock = useCanvasStore((state) => state.removeBlock);
	const duplicateBlock = useCanvasStore((state) => state.duplicateBlock);
	const selectedBlockId = useCanvasStore((state) => state.selectedBlockId);
	const selectBlock = useCanvasStore((state) => state.selectBlock);

	// Set up keyboard shortcuts
	React.useEffect(() => {
		const handleKeyDown = createKeyboardHandler({
			undo,
			redo,
			canUndo,
			canRedo,
			removeBlock,
			duplicateBlock,
			selectedBlockId,
			selectBlock,
		});

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		undo,
		redo,
		canUndo,
		canRedo,
		removeBlock,
		selectedBlockId,
		duplicateBlock,
		selectBlock,
	]);
}

// Helper function to create keyboard handler
function createKeyboardHandler(handlers: {
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;
	removeBlock: (id: string) => void;
	duplicateBlock: (id: string) => void;
	selectedBlockId: string | null;
	selectBlock: (id: string | null) => void;
}) {
	return (e: KeyboardEvent) => {
		const isModKey = e.ctrlKey || e.metaKey;
		const target = e.target as HTMLElement;
		const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName);

		// Undo: Ctrl/Cmd + Z
		if (isModKey && e.key === 'z' && !e.shiftKey && handlers.canUndo()) {
			e.preventDefault();
			handlers.undo();
			return;
		}

		// Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
		if (
			isModKey &&
			((e.key === 'z' && e.shiftKey) || e.key === 'y') &&
			handlers.canRedo()
		) {
			e.preventDefault();
			handlers.redo();
			return;
		}

		// Delete: Delete or Backspace (only if not in input)
		if (
			(e.key === 'Delete' || e.key === 'Backspace') &&
			handlers.selectedBlockId &&
			!isInputField
		) {
			e.preventDefault();
			handlers.removeBlock(handlers.selectedBlockId);
			return;
		}

		// Duplicate: Ctrl/Cmd + D
		if (isModKey && e.key === 'd' && handlers.selectedBlockId) {
			e.preventDefault();
			handlers.duplicateBlock(handlers.selectedBlockId);
			return;
		}

		// Deselect: Escape
		if (e.key === 'Escape' && handlers.selectedBlockId) {
			e.preventDefault();
			handlers.selectBlock(null);
		}
	};
}
