import type { BlockIR, Document } from '@requil/types';
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
	editingBlockId: string | null;

	// Drag & Drop
	draggedBlock: BlockIR | null;
	dropTargetId: string | null;
	dropPosition: 'before' | 'after' | 'inside' | null;

	// UI State
	viewport: 'desktop' | 'mobile';
	zoom: number;
	isModified: boolean;
}

// Canvas actions
interface CanvasActions {
	// Document actions
	setDocument: (doc: Document) => void;
	updateBlock: (blockId: string, updates: Partial<BlockIR>) => void;
	updateMetadata: (metadata: Partial<Document['metadata']>) => void;
	addBlock: (parentId: string, block: BlockIR, position?: number) => void;
	removeBlock: (blockId: string) => void;
	moveBlock: (blockId: string, newParentId: string, position: number) => void;
	moveBlockUp: (blockId: string) => void;
	moveBlockDown: (blockId: string) => void;
	selectParentBlock: (blockId: string) => void;
	duplicateBlock: (blockId: string) => void;

	// History actions
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;

	// Selection actions
	selectBlock: (blockId: string | null) => void;
	hoverBlock: (blockId: string | null) => void;
	getSelectedBlock: () => BlockIR | null;
	startEditing: (blockId: string) => void;
	stopEditing: () => void;

	// Drag & Drop actions
	startDrag: (block: BlockIR) => void;
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
	editingBlockId: null,
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

			// Update document metadata
			updateMetadata: (metadata) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const newDoc = {
					...document,
					metadata: {
						...document.metadata,
						...metadata,
					},
				};

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

			// Update a block's properties
			updateBlock: (blockId, updates) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const block = findBlockInTree(document.root, blockId);
				if (!block) return;

				let newRoot = updateBlockInTree(document.root, blockId, updates);

				// If updating columnCount for a Columns block, sync the children
				if (
					block.type === 'Columns' &&
					updates.props &&
					'columnCount' in updates.props
				) {
					const newColumnCount =
						typeof updates.props.columnCount === 'number'
							? updates.props.columnCount
							: 2;
					const currentColumnCount = block.children?.length || 0;
					const diff = newColumnCount - currentColumnCount;

					if (diff > 0) {
						// Add columns
						for (let i = 0; i < diff; i++) {
							const newColumn: BlockIR = {
								id: `col_${Date.now()}_${i}`,
								type: 'Column',
								props: { width: 'auto' },
							};
							newRoot = addBlockToTree(newRoot, blockId, newColumn);
						}
					} else if (diff < 0 && block.children) {
						// Remove columns
						const columnsToRemove = block.children.slice(newColumnCount);
						for (const col of columnsToRemove) {
							newRoot = removeBlockFromTree(newRoot, col.id) || newRoot;
						}
					}
				}

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

			removeBlock: (blockId) => {
				const { document, history } = get();
				if (!(document && history)) return;

				const blockToRemove = findBlockInTree(document.root, blockId);
				const parent = findParentOfBlock(document.root, blockId);

				if (blockToRemove?.type === 'Column' && parent?.type === 'Columns') {
					const remainingColumns = (parent.children?.length || 0) - 1;

					if (remainingColumns === 0) {
						const columnsParent = findParentOfBlock(document.root, parent.id);
						if (columnsParent) {
							const newRoot = removeBlockFromTree(document.root, parent.id);
							if (!newRoot) return;

							const newDoc = { ...document, root: newRoot };

							set({
								document: newDoc,
								history: {
									past: [...history.past, history.present],
									present: newDoc,
									future: [],
								},
								selectedBlockId: null,
								isModified: true,
							});
							return;
						}
					} else {
						let newRoot = removeBlockFromTree(document.root, blockId);
						if (!newRoot) return;

						newRoot = updateBlockInTree(newRoot, parent.id, {
							props: {
								columnCount: remainingColumns,
							},
						});

						const newDoc = { ...document, root: newRoot };

						set({
							document: newDoc,
							history: {
								past: [...history.past, history.present],
								present: newDoc,
								future: [],
							},
							selectedBlockId: null,
							isModified: true,
						});
						return;
					}
				}

				const newRoot = removeBlockFromTree(document.root, blockId);
				if (!newRoot) return;

				const newDoc = { ...document, root: newRoot };

				set({
					document: newDoc,
					history: {
						past: [...history.past, history.present],
						present: newDoc,
						future: [],
					},
					selectedBlockId: null,
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

			// Move block up in its parent's children
			moveBlockUp: (blockId) => {
				const { document, history } = get();
				if (!document) return;
				if (!history) return;

				const parent = findParentOfBlock(document.root, blockId);
				if (!parent) return;
				if (!parent.children) return;

				const currentIndex = parent.children.findIndex((b) => b.id === blockId);
				if (currentIndex <= 0) return; // Already at top or not found

				// Use moveBlock to swap positions
				const block = parent.children[currentIndex];
				if (!block) return;

				// Remove from old location
				let newRoot = removeBlockFromTree(document.root, blockId);
				if (!newRoot) return;

				// Add at new position (one up)
				newRoot = addBlockToTree(newRoot, parent.id, block, currentIndex - 1);

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

			// Move block down in its parent's children
			moveBlockDown: (blockId) => {
				const { document, history } = get();
				if (!document) return;
				if (!history) return;

				const parent = findParentOfBlock(document.root, blockId);
				if (!parent) return;
				if (!parent.children) return;

				const currentIndex = parent.children.findIndex((b) => b.id === blockId);
				if (currentIndex === -1) return; // Not found
				if (currentIndex >= parent.children.length - 1) return; // Already at bottom

				// Use moveBlock to swap positions
				const block = parent.children[currentIndex];
				if (!block) return;

				// Remove from old location
				let newRoot = removeBlockFromTree(document.root, blockId);
				if (!newRoot) return;

				// Add at new position (one down)
				newRoot = addBlockToTree(newRoot, parent.id, block, currentIndex + 1);

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

			// Select parent block
			selectParentBlock: (blockId) => {
				const { document } = get();
				if (!document) return;

				const parent = findParentOfBlock(document.root, blockId);
				if (parent) {
					set({ selectedBlockId: parent.id });
				}
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
			selectBlock: (blockId) =>
				set({ selectedBlockId: blockId, editingBlockId: null }),

			// Hover block
			hoverBlock: (blockId) => set({ hoveredBlockId: blockId }),

			// Get selected block
			getSelectedBlock: () => {
				const { document, selectedBlockId } = get();
				if (!(document && selectedBlockId)) return null;
				return findBlockInTree(document.root, selectedBlockId);
			},

			// Start editing
			startEditing: (blockId) =>
				set({ editingBlockId: blockId, selectedBlockId: blockId }),

			// Stop editing
			stopEditing: () => set({ editingBlockId: null }),

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
	block: BlockIR,
	targetId: string,
	updates: Partial<BlockIR>
): BlockIR {
	if (block.id === targetId) {
		return {
			...block,
			...updates,
			props: updates.props ? { ...block.props, ...updates.props } : block.props,
		};
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
	block: BlockIR,
	parentId: string,
	newBlock: BlockIR,
	position?: number
): BlockIR {
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
function removeBlockFromTree(block: BlockIR, targetId: string): BlockIR | null {
	// Can't remove root
	if (block.id === targetId) {
		return null;
	}

	if (block.children) {
		const newChildren = block.children
			.filter((child) => child.id !== targetId)
			.map((child) => removeBlockFromTree(child, targetId))
			.filter((child): child is BlockIR => child !== null);

		return { ...block, children: newChildren };
	}

	return block;
}

// Find a block in the tree
function findBlockInTree(block: BlockIR, targetId: string): BlockIR | null {
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
function findParentOfBlock(block: BlockIR, targetId: string): BlockIR | null {
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
function cloneBlockWithNewIds(block: BlockIR): BlockIR {
	const newId = crypto.randomUUID();

	return {
		...block,
		id: newId,
		children: block.children?.map((child) => cloneBlockWithNewIds(child)),
	};
}
