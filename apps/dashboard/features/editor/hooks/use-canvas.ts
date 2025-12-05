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
	const editingBlockId = useCanvasStore((state) => state.editingBlockId);
	const viewport = useCanvasStore((state) => state.viewport);
	const zoom = useCanvasStore((state) => state.zoom);
	const canvasWidth = useCanvasStore((state) => state.canvasWidth);
	const isModified = useCanvasStore((state) => state.isModified);

	// Actions
	const setDocument = useCanvasStore((state) => state.setDocument);
	const updateBlock = useCanvasStore((state) => state.updateBlock);
	const updateMetadata = useCanvasStore((state) => state.updateMetadata);
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
	const startEditing = useCanvasStore((state) => state.startEditing);
	const stopEditing = useCanvasStore((state) => state.stopEditing);

	const startDrag = useCanvasStore((state) => state.startDrag);
	const endDrag = useCanvasStore((state) => state.endDrag);
	const setDropTarget = useCanvasStore((state) => state.setDropTarget);

	const setViewport = useCanvasStore((state) => state.setViewport);
	const setZoom = useCanvasStore((state) => state.setZoom);
	const setCanvasWidth = useCanvasStore((state) => state.setCanvasWidth);

	const markAsModified = useCanvasStore((state) => state.markAsModified);
	const markAsSaved = useCanvasStore((state) => state.markAsSaved);
	const reset = useCanvasStore((state) => state.reset);

	// Variables
	const previewMode = useCanvasStore((state) => state.previewMode);
	const previewData = useCanvasStore((state) => state.previewData);

	// Computed values
	const selectedBlock = getSelectedBlock();

	return {
		// State
		document,
		selectedBlockId,
		selectedBlock,
		hoveredBlockId,
		editingBlockId,
		viewport,
		zoom,
		canvasWidth,
		isModified,

		// Document actions
		setDocument,
		updateBlock,
		updateMetadata,
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
		startEditing,
		stopEditing,

		// Drag & Drop
		startDrag,
		endDrag,
		setDropTarget,

		// UI
		setViewport,
		setZoom,
		setCanvasWidth,

		// Utility
		markAsModified,
		markAsSaved,
		reset,

		// Variables
		previewMode,
		previewData,
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
	const editingBlockId = useCanvasStore((state) => state.editingBlockId);
	const selectBlock = useCanvasStore((state) => state.selectBlock);
	const stopEditing = useCanvasStore((state) => state.stopEditing);

	React.useEffect(() => {
		const handleKeyDown = createKeyboardHandler({
			undo,
			redo,
			canUndo,
			canRedo,
			removeBlock,
			duplicateBlock,
			selectedBlockId,
			editingBlockId,
			selectBlock,
			stopEditing,
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
		editingBlockId,
		duplicateBlock,
		selectBlock,
		stopEditing,
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
	editingBlockId: string | null;
	selectBlock: (id: string | null) => void;
	stopEditing: () => void;
}) {
	return (e: KeyboardEvent) => {
		const isModKey = e.ctrlKey || e.metaKey;
		const target = e.target as HTMLElement;
		const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName);
		const isEditing = handlers.editingBlockId !== null;

		if (isEditing) {
			if (e.key === 'Escape') {
				e.preventDefault();
				handlers.stopEditing();
			}
			return;
		}

		if (isModKey && e.key === 'z' && !e.shiftKey && handlers.canUndo()) {
			e.preventDefault();
			handlers.undo();
			return;
		}

		if (
			isModKey &&
			((e.key === 'z' && e.shiftKey) || e.key === 'y') &&
			handlers.canRedo()
		) {
			e.preventDefault();
			handlers.redo();
			return;
		}

		if (
			(e.key === 'Delete' || e.key === 'Backspace') &&
			handlers.selectedBlockId &&
			!isInputField &&
			!isEditing
		) {
			e.preventDefault();
			handlers.removeBlock(handlers.selectedBlockId);
			return;
		}

		if (isModKey && e.key === 'd' && handlers.selectedBlockId && !isEditing) {
			e.preventDefault();
			handlers.duplicateBlock(handlers.selectedBlockId);
			return;
		}

		if (e.key === 'Escape' && handlers.selectedBlockId && !isEditing) {
			e.preventDefault();
			handlers.selectBlock(null);
		}
	};
}
