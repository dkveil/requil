import type { Block, Document } from '@requil/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// History state for undo/redo
interface HistoryState {
	past: Document[];
	present: Document;
	future: Document[];
}

// Canvas state
interface CanvasState {
	// Document state
	document: Document | null;
	history: HistoryState | null;

	// Selection
	selectedBlockId: string | null;
	hoveredBlockId: string | null;

	// Drag & Drop
	draggedBlock: Block | null;
	dropTargetId: string | null;
	dropPosition: 'before' | 'after' | 'inside' | null;

	// UI State
	viewport: 'desktop' | 'mobile';
	zoom: number;
	isModified: boolean; // Track if document has unsaved changes
}

// Canvas actions
interface CanvasActions {
	// Document actions
	setDocument: (doc: Document) => void;
	updateBlock: (blockId: string, updates: Partial<Block>) => void;
	addBlock: (parentId: string, block: Block, position?: number) => void;
	removeBlock: (blockId: string) => void;
	moveBlock: (blockId: string, newParentId: string, position: number) => void;
	duplicateBlock: (blockId: string) => void;

	// History actions
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;

	// Selection actions
	selectBlock: (blockId: string | null) => void;
	hoverBlock: (blockId: string | null) => void;
	getSelectedBlock: () => Block | null;

	// Drag & Drop actions
	startDrag: (block: Block) => void;
	endDrag: () => void;
	setDropTarget: (
		targetId: string | null,
		position: 'before' | 'after' | 'inside' | null
	) => void;

	// UI actions
	setViewport: (viewport: 'desktop' | 'mobile') => void;
	setZoom: (zoom: number) => void;

	// Utility
	reset: () => void;
	markAsModified: () => void;
	markAsSaved: () => void;
}

const initialState: CanvasState = {
	document: null,
	history: null,
	selectedBlockId: null,
	hoveredBlockId: null,
	draggedBlock: null,
	dropTargetId: null,
	dropPosition: null,
	viewport: 'desktop',
	zoom: 1,
	isModified: false,
};

export const useCanvasStore = create<CanvasState & CanvasActions>()(
	devtools(
		(set, get) => ({
			...initialState,

			// Set initial document
			setDocument: (doc) =>
				set({
					document: doc,
					history: {
						past: [],
						present: doc,
						future: [],
					},
					isModified: false,
				}),

			// Update a block's properties
			updateBlock: (blockId, updates) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const newRoot = updateBlockInTree(document.root, blockId, updates);
				const newDoc = { ...document, root: newRoot };

				set({
					document: newDoc,
					history: {
						past: [...history.past, history.present],
						present: newDoc,
						future: [],
					},
					isModified: true,
				});
			},

			// Add a block to a parent
			addBlock: (parentId, block, position) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const newRoot = addBlockToTree(
					document.root,
					parentId,
					block,
					position
				);
				const newDoc = { ...document, root: newRoot };

				set({
					document: newDoc,
					history: {
						past: [...history.past, history.present],
						present: newDoc,
						future: [],
					},
					isModified: true,
				});
			},

			// Remove a block
			removeBlock: (blockId) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const newRoot = removeBlockFromTree(document.root, blockId);
				if (!newRoot) return; // Can't remove root

				const newDoc = { ...document, root: newRoot };

				set({
					document: newDoc,
					history: {
						past: [...history.past, history.present],
						present: newDoc,
						future: [],
					},
					selectedBlockId: null, // Deselect if selected block was removed
					isModified: true,
				});
			},

			// Move a block to a new parent
			moveBlock: (blockId, newParentId, position) => {
				const { document, history } = get();
				if (!(document && history)) return;

				// First, find and extract the block
				const blockToMove = findBlockInTree(document.root, blockId);
				if (!blockToMove) return;

				// Remove from old location
				let newRoot = removeBlockFromTree(document.root, blockId);
				if (!newRoot) return;

				// Add to new location
				newRoot = addBlockToTree(newRoot, newParentId, blockToMove, position);

				const newDoc = { ...document, root: newRoot };

				set({
					document: newDoc,
					history: {
						past: [...history.past, history.present],
						present: newDoc,
						future: [],
					},
					isModified: true,
				});
			},

			// Duplicate a block
			duplicateBlock: (blockId) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const blockToDuplicate = findBlockInTree(document.root, blockId);
				if (!blockToDuplicate) return;

				// Find parent
				const parent = findParentOfBlock(document.root, blockId);
				if (!parent) return;

				// Clone block with new IDs
				const clonedBlock = cloneBlockWithNewIds(blockToDuplicate);

				// Find position of original block
				const position = parent.children?.findIndex((b) => b.id === blockId);
				if (position === undefined || position === -1) return;

				// Add after the original
				const newRoot = addBlockToTree(
					document.root,
					parent.id,
					clonedBlock,
					position + 1
				);
				const newDoc = { ...document, root: newRoot };

				set({
					document: newDoc,
					history: {
						past: [...history.past, history.present],
						present: newDoc,
						future: [],
					},
					selectedBlockId: clonedBlock.id, // Select the new block
					isModified: true,
				});
			},

			// Undo
			undo: () => {
				const { history } = get();
				if (!history || history.past.length === 0) return;

				const previous = history.past[history.past.length - 1]!;
				const newPast = history.past.slice(0, -1);

				set({
					document: previous,
					history: {
						past: newPast,
						present: previous,
						future: [history.present, ...history.future],
					},
				});
			},

			// Redo
			redo: () => {
				const { history } = get();
				if (!history || history.future.length === 0) return;

				const next = history.future[0]!;
				const newFuture = history.future.slice(1);

				set({
					document: next,
					history: {
						past: [...history.past, history.present],
						present: next,
						future: newFuture,
					},
				});
			},

			// Check if can undo
			canUndo: () => {
				const { history } = get();
				return !!history && history.past.length > 0;
			},

			// Check if can redo
			canRedo: () => {
				const { history } = get();
				return !!history && history.future.length > 0;
			},

			// Select block
			selectBlock: (blockId) => set({ selectedBlockId: blockId }),

			// Hover block
			hoverBlock: (blockId) => set({ hoveredBlockId: blockId }),

			// Get selected block
			getSelectedBlock: () => {
				const { document, selectedBlockId } = get();
				if (!(document && selectedBlockId)) return null;
				return findBlockInTree(document.root, selectedBlockId);
			},

			// Start drag
			startDrag: (block) => set({ draggedBlock: block }),

			// End drag
			endDrag: () =>
				set({ draggedBlock: null, dropTargetId: null, dropPosition: null }),

			// Set drop target
			setDropTarget: (targetId, position) =>
				set({ dropTargetId: targetId, dropPosition: position }),

			// Set viewport
			setViewport: (viewport) => set({ viewport }),

			// Set zoom
			setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),

			// Mark as modified
			markAsModified: () => set({ isModified: true }),

			// Mark as saved
			markAsSaved: () => set({ isModified: false }),

			// Reset
			reset: () => set(initialState),
		}),
		{ name: 'canvas-store' }
	)
);

// Helper functions

// Update a block in the tree
function updateBlockInTree(
	block: Block,
	targetId: string,
	updates: Partial<Block>
): Block {
	if (block.id === targetId) {
		return { ...block, ...updates };
	}

	if (block.children) {
		return {
			...block,
			children: block.children.map((child) =>
				updateBlockInTree(child, targetId, updates)
			),
		};
	}

	return block;
}

// Add a block to the tree
function addBlockToTree(
	block: Block,
	parentId: string,
	newBlock: Block,
	position?: number
): Block {
	if (block.id === parentId) {
		const children = block.children || [];
		const insertPosition = position !== undefined ? position : children.length;
		const newChildren = [
			...children.slice(0, insertPosition),
			newBlock,
			...children.slice(insertPosition),
		];
		return { ...block, children: newChildren };
	}

	if (block.children) {
		return {
			...block,
			children: block.children.map((child) =>
				addBlockToTree(child, parentId, newBlock, position)
			),
		};
	}

	return block;
}

// Remove a block from the tree
function removeBlockFromTree(block: Block, targetId: string): Block | null {
	// Can't remove root
	if (block.id === targetId) {
		return null;
	}

	if (block.children) {
		const newChildren = block.children
			.filter((child) => child.id !== targetId)
			.map((child) => removeBlockFromTree(child, targetId))
			.filter((child): child is Block => child !== null);

		return { ...block, children: newChildren };
	}

	return block;
}

// Find a block in the tree
function findBlockInTree(block: Block, targetId: string): Block | null {
	if (block.id === targetId) {
		return block;
	}

	if (block.children) {
		for (const child of block.children) {
			const found = findBlockInTree(child, targetId);
			if (found) return found;
		}
	}

	return null;
}

// Find parent of a block
function findParentOfBlock(block: Block, targetId: string): Block | null {
	if (block.children) {
		for (const child of block.children) {
			if (child.id === targetId) {
				return block;
			}
			const found = findParentOfBlock(child, targetId);
			if (found) return found;
		}
	}

	return null;
}

// Clone a block with new IDs (for duplication)
function cloneBlockWithNewIds(block: Block): Block {
	const newId = crypto.randomUUID();

	return {
		...block,
		id: newId,
		children: block.children?.map((child) => cloneBlockWithNewIds(child)),
	};
}
