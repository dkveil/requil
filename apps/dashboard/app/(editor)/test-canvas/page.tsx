'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BlockRenderer } from '@/features/editor/components/block-renderer';
import {
	useCanvas,
	useCanvasKeyboardShortcuts,
} from '@/features/editor/hooks/use-canvas';
import {
	createBlock,
	createDefaultDocument,
} from '@/features/editor/lib/block-factory';

export default function TestCanvasPage() {
	const {
		document,
		selectedBlockId,
		selectedBlock,
		hoveredBlockId,
		isModified,
		setDocument,
		selectBlock,
		hoverBlock,
		updateBlock,
		addBlock,
		removeBlock,
		duplicateBlock,
		undo,
		redo,
		canUndo,
		canRedo,
		viewport,
		setViewport,
		zoom,
		setZoom,
	} = useCanvas();

	// Enable keyboard shortcuts
	useCanvasKeyboardShortcuts();

	// Initialize with a sample document
	useEffect(() => {
		const container = createDefaultDocument();
		if (container) {
			const section1 = createBlock('Section', {
				backgroundColor: '#E0F2FE',
				paddingTop: 30,
				paddingBottom: 30,
			});
			const section2 = createBlock('Section', {
				backgroundColor: '#FEF3C7',
				paddingTop: 20,
				paddingBottom: 20,
			});
			const columns = createBlock('Columns', { columnCount: 2, gap: 20 });

			if (section1 && section2 && columns) {
				container.children = [section1, section2, columns];
			}

			setDocument({
				version: '1.0',
				root: container,
				metadata: {
					title: 'Test Document',
					description: 'Canvas Store Test',
				},
			});
		}
	}, [setDocument]);

	if (!document) {
		return (
			<div className='p-8'>
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className='h-screen flex flex-col bg-background'>
			{/* Header */}
			<div className='border-b bg-card px-4 py-3 flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<h1 className='text-xl font-bold text-foreground'>
						Canvas Store Test
					</h1>
					{isModified && (
						<span className='text-sm text-orange-600 font-medium'>
							● Unsaved changes
						</span>
					)}
				</div>

				<div className='flex items-center gap-2'>
					{/* Undo/Redo */}
					<Button
						variant='outline'
						size='sm'
						onClick={undo}
						disabled={!canUndo}
					>
						Undo (Ctrl+Z)
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={redo}
						disabled={!canRedo}
					>
						Redo (Ctrl+Y)
					</Button>

					<div className='w-px h-6 bg-border mx-2' />

					{/* Viewport */}
					<Button
						variant={viewport === 'desktop' ? 'default' : 'outline'}
						size='sm'
						onClick={() => setViewport('desktop')}
					>
						Desktop
					</Button>
					<Button
						variant={viewport === 'mobile' ? 'default' : 'outline'}
						size='sm'
						onClick={() => setViewport('mobile')}
					>
						Mobile
					</Button>

					<div className='w-px h-6 bg-border mx-2' />

					{/* Zoom */}
					<Button
						variant='outline'
						size='sm'
						onClick={() => setZoom(zoom - 0.1)}
					>
						-
					</Button>
					<span className='text-sm font-medium min-w-[60px] text-center text-foreground'>
						{Math.round(zoom * 100)}%
					</span>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setZoom(zoom + 0.1)}
					>
						+
					</Button>
				</div>
			</div>

			<div className='flex flex-1 overflow-hidden'>
				{/* Main Canvas */}
				<div className='flex-1 overflow-auto bg-muted p-8'>
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
						/>
					</div>
				</div>

				{/* Right Sidebar - Properties */}
				<div className='w-80 border-l bg-card overflow-auto'>
					<div className='p-4'>
						<h2 className='text-lg font-semibold mb-4 text-foreground'>
							Properties
						</h2>

						{selectedBlock ? (
							<div className='space-y-4'>
								<div>
									<label
										htmlFor='blockType'
										className='text-sm font-medium text-muted-foreground'
									>
										Block Type
									</label>
									<p className='text-sm text-foreground mt-1'>
										{selectedBlock.type}
									</p>
								</div>

								<div>
									<label
										htmlFor='blockId'
										className='text-sm font-medium text-muted-foreground'
									>
										Block ID
									</label>
									<p className='text-xs text-muted-foreground mt-1 font-mono break-all'>
										{selectedBlock.id}
									</p>
								</div>

								<div className='pt-4 border-t'>
									<h3 className='text-sm font-semibold mb-3 text-foreground'>
										Actions
									</h3>
									<div className='space-y-2'>
										<Button
											variant='outline'
											size='sm'
											className='w-full'
											onClick={() => duplicateBlock(selectedBlock.id)}
										>
											Duplicate (Ctrl+D)
										</Button>
										<Button
											variant='outline'
											size='sm'
											className='w-full text-red-600 hover:text-red-700'
											onClick={() => removeBlock(selectedBlock.id)}
										>
											Delete (Del)
										</Button>
									</div>
								</div>

								<div className='pt-4 border-t'>
									<h3 className='text-sm font-semibold mb-3 text-foreground'>
										Properties
									</h3>
									<div className='space-y-3'>
										{Object.entries(selectedBlock.props).map(([key, value]) => (
											<div key={key}>
												<label
													htmlFor={key}
													className='text-xs font-medium text-muted-foreground'
												>
													{key}
												</label>
												<div className='mt-1'>
													{typeof value === 'boolean' ? (
														<input
															type='checkbox'
															checked={value}
															onChange={(e) =>
																updateBlock(selectedBlock.id, {
																	props: {
																		...selectedBlock.props,
																		[key]: e.target.checked,
																	},
																})
															}
															className='h-4 w-4'
														/>
													) : typeof value === 'number' ? (
														<input
															type='number'
															value={value}
															onChange={(e) =>
																updateBlock(selectedBlock.id, {
																	props: {
																		...selectedBlock.props,
																		[key]: Number(e.target.value),
																	},
																})
															}
															className='w-full px-2 py-1 text-sm border rounded'
														/>
													) : (
														<input
															type='text'
															value={String(value)}
															onChange={(e) =>
																updateBlock(selectedBlock.id, {
																	props: {
																		...selectedBlock.props,
																		[key]: e.target.value,
																	},
																})
															}
															className='w-full px-2 py-1 text-sm border rounded'
														/>
													)}
												</div>
											</div>
										))}
									</div>
								</div>

								<div className='pt-4 border-t'>
									<h3 className='text-sm font-semibold mb-3 text-foreground'>
										Add Child Block
									</h3>
									<div className='space-y-2'>
										<Button
											variant='outline'
											size='sm'
											className='w-full'
											onClick={() => {
												const spacer = createBlock('Spacer', { height: 20 });
												if (spacer) addBlock(selectedBlock.id, spacer);
											}}
										>
											Add Spacer
										</Button>
										<Button
											variant='outline'
											size='sm'
											className='w-full'
											onClick={() => {
												const divider = createBlock('Divider', {
													thickness: 1,
												});
												if (divider) addBlock(selectedBlock.id, divider);
											}}
										>
											Add Divider
										</Button>
									</div>
								</div>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>No block selected</p>
						)}
					</div>
				</div>
			</div>

			{/* Footer - Keyboard Shortcuts Info */}
			<div className='border-t bg-muted px-4 py-2 text-xs text-muted-foreground'>
				<span className='font-semibold'>Keyboard Shortcuts:</span> Ctrl+Z (Undo)
				| Ctrl+Y (Redo) | Del (Delete) | Ctrl+D (Duplicate) | Esc (Deselect)
			</div>
		</div>
	);
}
