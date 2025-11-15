'use client';

import { useDraggable } from '@dnd-kit/core';
import type { ComponentCategory } from '@requil/types';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AssetsPanel } from '../components/assets-panel';
import { ComponentIcon } from '../components/component-icon';
import { componentRegistry } from '../registry/component-registry';
import { LayersPanel } from './layers-panel';

const CATEGORY_ORDER: ComponentCategory[] = [
	'layout',
	'content',
	'media',
	'logic',
	'data',
];

interface ElementsSidebarProps {
	onAddBlock?: (blockType: string) => void;
	workspaceId: string;
}

export function ElementsSidebar({
	onAddBlock,
	workspaceId,
}: ElementsSidebarProps) {
	const t = useTranslations('editor.elementsSidebar');
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('elements');
	const [expandedCategories, setExpandedCategories] = useState<
		Set<ComponentCategory>
	>(new Set(['layout', 'content']));

	// Get all components grouped by category (excluding hidden ones)
	const componentsByCategory = CATEGORY_ORDER.reduce(
		(acc, category) => {
			const components = componentRegistry
				.getByCategory(category)
				.filter((comp) => !comp.isHidden);
			if (components.length > 0) {
				acc[category] = components;
			}
			return acc;
		},
		{} as Record<
			ComponentCategory,
			ReturnType<typeof componentRegistry.getByCategory>
		>
	);

	// Filter components by search query
	const filteredCategories = Object.entries(componentsByCategory).reduce(
		(acc, [category, components]) => {
			const filtered = components.filter(
				(comp) =>
					comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					comp.type.toLowerCase().includes(searchQuery.toLowerCase())
			);
			if (filtered.length > 0) {
				acc[category as ComponentCategory] = filtered;
			}
			return acc;
		},
		{} as Record<
			ComponentCategory,
			(typeof componentsByCategory)[ComponentCategory]
		>
	);

	const toggleCategory = (category: ComponentCategory) => {
		setExpandedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(category)) {
				next.delete(category);
			} else {
				next.add(category);
			}
			return next;
		});
	};

	const handleAddBlock = (blockType: string) => {
		onAddBlock?.(blockType);
	};

	return (
		<div className='h-[calc(100%-49px)] border-r flex'>
			{/* Left Icon Menu */}
			<div className='w-12 border-r flex flex-col bg-muted/30'>
				<button
					type='button'
					onClick={() => setActiveTab('elements')}
					className={cn(
						'h-12 flex items-center justify-center border-b transition-colors',
						activeTab === 'elements'
							? 'bg-background text-primary border-r-2 border-r-primary'
							: 'hover:bg-muted/50 text-muted-foreground'
					)}
					title={t('addElements')}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='w-5 h-5'
					>
						<title>{t('addElements')}</title>
						<rect
							x='3'
							y='3'
							width='7'
							height='7'
						/>
						<rect
							x='14'
							y='3'
							width='7'
							height='7'
						/>
						<rect
							x='14'
							y='14'
							width='7'
							height='7'
						/>
						<rect
							x='3'
							y='14'
							width='7'
							height='7'
						/>
					</svg>
				</button>
				<button
					type='button'
					onClick={() => setActiveTab('layers')}
					className={cn(
						'h-12 flex items-center justify-center border-b transition-colors',
						activeTab === 'layers'
							? 'bg-background text-primary border-r-2 border-r-primary'
							: 'hover:bg-muted/50 text-muted-foreground'
					)}
					title={t('layers')}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='w-5 h-5'
					>
						<title>{t('layers')}</title>
						<path d='m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' />
						<path d='m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' />
						<path d='m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' />
					</svg>
				</button>
				<button
					type='button'
					onClick={() => setActiveTab('assets')}
					className={cn(
						'h-12 flex items-center justify-center border-b transition-colors',
						activeTab === 'assets'
							? 'bg-background text-primary border-r-2 border-r-primary'
							: 'hover:bg-muted/50 text-muted-foreground'
					)}
					title={t('assets')}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='w-5 h-5'
					>
						<title>{t('assets')}</title>
						<rect
							width='18'
							height='18'
							x='3'
							y='3'
							rx='2'
							ry='2'
						/>
						<circle
							cx='9'
							cy='9'
							r='2'
						/>
						<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
					</svg>
				</button>
			</div>

			{/* Right Panel Content */}
			<div className='w-64 flex flex-col'>
				{activeTab === 'elements' ? (
					<>
						{/* Header */}
						<div className='p-4 border-b'>
							<h2 className='text-sm font-semibold mb-3 text-foreground'>
								{t('addElements')}
							</h2>

							{/* Search */}
							<div className='relative'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									type='search'
									placeholder={t('searchPlaceholder')}
									className='pl-8 h-9 text-sm bg-background'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>

						{/* Categories */}
						<div className='flex-1 overflow-auto'>
							{Object.entries(filteredCategories).map(
								([category, components]) => {
									const isExpanded = expandedCategories.has(
										category as ComponentCategory
									);

									return (
										<div
											key={category}
											className='border-b'
										>
											{/* Category Header */}
											<button
												type='button'
												onClick={() =>
													toggleCategory(category as ComponentCategory)
												}
												className='w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer'
											>
												<span className='text-sm font-medium text-foreground'>
													{t(`${category}.title`)}
												</span>
												{isExpanded ? (
													<ChevronDown className='h-4 w-4 text-muted-foreground' />
												) : (
													<ChevronRight className='h-4 w-4 text-muted-foreground' />
												)}
											</button>

											{/* Components Grid */}
											{isExpanded && (
												<div className='px-3 pb-3 grid grid-cols-2 gap-2'>
													{components.map((component) => (
														<DraggableComponentButton
															key={component.type}
															componentType={component.type}
															componentName={component.name}
															onAddBlock={handleAddBlock}
														/>
													))}
												</div>
											)}
										</div>
									);
								}
							)}
						</div>
					</>
				) : activeTab === 'layers' ? (
					<>
						{/* Header */}
						<div className='p-4 border-b'>
							<h2 className='text-sm font-semibold text-foreground'>
								{t('layers')}
							</h2>
						</div>

						{/* Layers Panel */}
						<LayersPanel className='flex-1' />
					</>
				) : (
					<>
						{/* Header */}
						<div className='p-4 border-b'>
							<h2 className='text-sm font-semibold text-foreground'>
								{t('assets')}
							</h2>
						</div>

						{/* Assets Panel */}
						<AssetsPanel
							workspaceId={workspaceId}
							filterType='image'
						/>
					</>
				)}
			</div>
		</div>
	);
}

// Draggable component button
interface DraggableComponentButtonProps {
	componentType: string;
	componentName: string;
	onAddBlock: (blockType: string) => void;
}

function DraggableComponentButton({
	componentType,
	componentName,
	onAddBlock,
}: DraggableComponentButtonProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `sidebar-${componentType}`,
		data: {
			type: componentType,
			source: 'sidebar',
		},
	});

	return (
		<button
			ref={setNodeRef}
			type='button'
			onClick={() => onAddBlock(componentType)}
			className={cn(
				'p-3 rounded-md border border-border bg-background',
				'hover:border-primary hover:bg-muted/50',
				'transition-all duration-200',
				'flex flex-col items-center justify-center gap-2',
				'cursor-grab active:cursor-grabbing group',
				isDragging && 'opacity-50'
			)}
			{...listeners}
			{...attributes}
		>
			{/* Icon/Preview */}
			<div className='w-full h-12 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors'>
				<ComponentIcon type={componentType} />
			</div>

			{/* Name */}
			<span className='text-xs font-medium text-center text-foreground group-hover:text-primary transition-colors'>
				{componentName}
			</span>
		</button>
	);
}
