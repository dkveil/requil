'use client';

import type { Block } from '@requil/types';
import { useState } from 'react';
import { BlockRenderer } from '@/features/editor/components/block-renderer';
import {
	createBlock,
	createDefaultDocument,
} from '@/features/editor/lib/block-factory';
import { componentRegistry } from '@/features/editor/registry/component-registry';

export default function TestBlocksPage() {
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
	// Test 1: Get all components
	const allComponents = componentRegistry.getAll();

	// Test 2: Get layout components
	const layoutComponents = componentRegistry.getByCategory('layout');

	// Test 3: Create some blocks
	const container = createDefaultDocument();
	const section = createBlock('Section', {
		backgroundColor: '#F5F5F5',
		paddingTop: 40,
	});
	const columns = createBlock('Columns', { columnCount: 3 });
	const spacer = createBlock('Spacer', { height: 30 });

	// Test 4: Validation
	const canSectionHaveButton = componentRegistry.canHaveChild(
		'Section',
		'Button'
	);
	const canSectionHaveColumn = componentRegistry.canHaveChild(
		'Section',
		'Column'
	);
	const canColumnsHaveSection = componentRegistry.canHaveChild(
		'Columns',
		'Section'
	);

	return (
		<div className='p-8 max-w-6xl mx-auto'>
			<h1 className='text-3xl font-bold mb-8'>Block System Test Page</h1>

			{/* Test 1: Component Registry */}
			<section className='mb-8 p-6 border rounded-lg'>
				<h2 className='text-2xl font-semibold mb-4'>1. Component Registry</h2>
				<p className='mb-2'>Total components: {allComponents.length}</p>
				<p className='mb-2'>Layout components: {layoutComponents.length}</p>
				<div className='mt-4'>
					<h3 className='font-semibold mb-2'>Available Components:</h3>
					<ul className='list-disc list-inside space-y-1'>
						{allComponents.map((comp) => (
							<li key={comp.type}>
								<span className='font-mono text-sm'>{comp.type}</span> -{' '}
								{comp.name}
								<span className='text-gray-500 text-sm'>
									{' '}
									({comp.category})
								</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Test 2: Create Blocks */}
			<section className='mb-8 p-6 border rounded-lg'>
				<h2 className='text-2xl font-semibold mb-4'>2. Block Creation</h2>

				<div className='space-y-4'>
					<div>
						<h3 className='font-semibold mb-2'>
							Container (Default Document):
						</h3>
						<pre className='bg-gray-100 p-4 rounded overflow-auto text-xs'>
							{JSON.stringify(container, null, 2)}
						</pre>
					</div>

					<div>
						<h3 className='font-semibold mb-2'>Section (Custom Props):</h3>
						<pre className='bg-gray-100 p-4 rounded overflow-auto text-xs'>
							{JSON.stringify(section, null, 2)}
						</pre>
					</div>

					<div>
						<h3 className='font-semibold mb-2'>
							Columns (Auto-creates 3 Column children):
						</h3>
						<pre className='bg-gray-100 p-4 rounded overflow-auto text-xs'>
							{JSON.stringify(columns, null, 2)}
						</pre>
					</div>

					<div>
						<h3 className='font-semibold mb-2'>Spacer (Void element):</h3>
						<pre className='bg-gray-100 p-4 rounded overflow-auto text-xs'>
							{JSON.stringify(spacer, null, 2)}
						</pre>
					</div>
				</div>
			</section>

			{/* Test 3: Validation */}
			<section className='mb-8 p-6 border rounded-lg'>
				<h2 className='text-2xl font-semibold mb-4'>3. Hierarchy Validation</h2>
				<ul className='space-y-2'>
					<li className='flex items-center gap-2'>
						<span
							className={
								canSectionHaveButton ? 'text-green-600' : 'text-red-600'
							}
						>
							{canSectionHaveButton ? '✅' : '❌'}
						</span>
						<span>
							Can Section have Button child?{' '}
							<strong>{canSectionHaveButton ? 'Yes' : 'No'}</strong>
						</span>
					</li>
					<li className='flex items-center gap-2'>
						<span
							className={
								!canSectionHaveColumn ? 'text-green-600' : 'text-red-600'
							}
						>
							{!canSectionHaveColumn ? '✅' : '❌'}
						</span>
						<span>
							Can Section have Column child?{' '}
							<strong>{canSectionHaveColumn ? 'Yes' : 'No'}</strong> (should be
							No)
						</span>
					</li>
					<li className='flex items-center gap-2'>
						<span
							className={
								!canColumnsHaveSection ? 'text-green-600' : 'text-red-600'
							}
						>
							{!canColumnsHaveSection ? '✅' : '❌'}
						</span>
						<span>
							Can Columns have Section child?{' '}
							<strong>{canColumnsHaveSection ? 'Yes' : 'No'}</strong> (should be
							No)
						</span>
					</li>
				</ul>
			</section>

			{/* Test 4: Component Details */}
			<section className='mb-8 p-6 border rounded-lg'>
				<h2 className='text-2xl font-semibold mb-4'>
					4. Component Definition Details
				</h2>
				<div className='space-y-4'>
					{layoutComponents.map((comp) => {
						const def = componentRegistry.get(comp.type);
						return (
							<div
								key={comp.type}
								className='border-l-4 border-blue-500 pl-4'
							>
								<h3 className='font-semibold text-lg'>{comp.name}</h3>
								<p className='text-sm text-gray-600 mb-2'>{comp.description}</p>
								<div className='grid grid-cols-2 gap-2 text-sm'>
									<div>
										<strong>Allowed Children:</strong>{' '}
										{def?.allowedChildren?.join(', ') || 'Any'}
									</div>
									<div>
										<strong>Allowed Parents:</strong>{' '}
										{def?.allowedParents?.join(', ') || 'Any'}
									</div>
									<div>
										<strong>Min Children:</strong> {def?.minChildren ?? 'N/A'}
									</div>
									<div>
										<strong>Max Children:</strong>{' '}
										{def?.maxChildren ?? 'Unlimited'}
									</div>
									<div>
										<strong>Is Void:</strong> {def?.isVoid ? 'Yes' : 'No'}
									</div>
									<div>
										<strong>MJML Tag:</strong> {def?.mjmlTag || 'N/A'}
									</div>
								</div>
								<div className='mt-2'>
									<strong>Inspector Fields:</strong>{' '}
									{def?.inspectorConfig?.fields.length || 0}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Test 5: Block Rendering */}
			<section className='mb-8 p-6 border rounded-lg'>
				<h2 className='text-2xl font-semibold mb-4'>
					5. Block Rendering (Visual)
				</h2>
				<p className='text-sm text-gray-600 mb-4'>
					Click on blocks to select them. Hover to see hover state.
					{selectedBlockId && (
						<span className='ml-2 font-semibold text-blue-600'>
							Selected: {selectedBlockId.slice(0, 8)}...
						</span>
					)}
				</p>

				<div className='space-y-6'>
					{/* Render Container */}
					<div>
						<h3 className='font-semibold mb-2'>
							Container with Section and Columns:
						</h3>
						<div className='bg-gray-50 p-4 rounded'>
							<BlockRenderer
								block={(() => {
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
										const columns = createBlock('Columns', {
											columnCount: 2,
											gap: 20,
										});

										container.children = [section1, section2, columns].filter(
											Boolean
										) as Block[];
									}
									return container;
								})()}
								isCanvas={true}
								onSelect={setSelectedBlockId}
								onHover={setHoveredBlockId}
								selectedBlockId={selectedBlockId}
								hoveredBlockId={hoveredBlockId}
							/>
						</div>
					</div>

					{/* Render Section */}
					<div>
						<h3 className='font-semibold mb-2'>
							Section with Spacer and Divider:
						</h3>
						<div className='bg-gray-50 p-4 rounded'>
							{(() => {
								const sec = createBlock('Section', {
									backgroundColor: '#F0FDF4',
									paddingTop: 40,
									paddingBottom: 40,
								});
								const spacer1 = createBlock('Spacer', { height: 20 });
								const divider = createBlock('Divider', {
									thickness: 2,
									color: '#10B981',
								});
								const spacer2 = createBlock('Spacer', { height: 20 });

								if (sec) {
									sec.children = [spacer1, divider, spacer2].filter(
										Boolean
									) as Block[];
								}

								return sec ? (
									<BlockRenderer
										block={sec}
										isCanvas={true}
										onSelect={setSelectedBlockId}
										onHover={setHoveredBlockId}
										selectedBlockId={selectedBlockId}
										hoveredBlockId={hoveredBlockId}
									/>
								) : null;
							})()}
						</div>
					</div>

					{/* Render Columns */}
					<div>
						<h3 className='font-semibold mb-2'>3 Columns Layout:</h3>
						<div className='bg-gray-50 p-4 rounded'>
							{columns && (
								<BlockRenderer
									block={columns}
									isCanvas={true}
									onSelect={setSelectedBlockId}
									onHover={setHoveredBlockId}
									selectedBlockId={selectedBlockId}
									hoveredBlockId={hoveredBlockId}
								/>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Test 6: Inspector Config */}
			<section className='mb-8 p-6 border rounded-lg'>
				<h2 className='text-2xl font-semibold mb-4'>
					6. Inspector Configuration (Section)
				</h2>
				<div>
					{(() => {
						const sectionDef = componentRegistry.get('Section');
						return (
							<div>
								<h3 className='font-semibold mb-2'>Groups:</h3>
								<ul className='list-disc list-inside mb-4'>
									{sectionDef?.inspectorConfig?.groups?.map((group) => (
										<li key={group.id}>
											{group.label} ({group.fields.length} fields)
										</li>
									))}
								</ul>

								<h3 className='font-semibold mb-2'>Fields:</h3>
								<div className='space-y-2'>
									{sectionDef?.inspectorConfig?.fields.map((field) => (
										<div
											key={field.key}
											className='bg-gray-50 p-2 rounded text-sm'
										>
											<strong>{field.label}</strong> ({field.type})
											{field.options && (
												<span className='ml-2 text-gray-600'>
													Options:{' '}
													{field.options.map((o) => o.label).join(', ')}
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})()}
				</div>
			</section>
		</div>
	);
}
