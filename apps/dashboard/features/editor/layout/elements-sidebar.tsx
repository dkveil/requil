'use client';

import { useDraggable } from '@dnd-kit/core';
import type { ComponentCategory } from '@requil/types';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ComponentIcon } from '../components/component-icon';
import { componentRegistry } from '../registry/component-registry';

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
	layout: 'Layout',
	content: 'Typography',
	media: 'Media',
	logic: 'Template',
	data: 'Data',
};

const CATEGORY_ORDER: ComponentCategory[] = [
	'layout',
	'content',
	'media',
	'logic',
	'data',
];

interface ElementsSidebarProps {
	onAddBlock?: (blockType: string) => void;
}

export function ElementsSidebar({ onAddBlock }: ElementsSidebarProps) {
	const t = useTranslations('editor.elementsSidebar');
	const [searchQuery, setSearchQuery] = useState('');
	const [expandedCategories, setExpandedCategories] = useState<
		Set<ComponentCategory>
	>(new Set(['layout']));

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
		<div className='w-64 h-full border-r flex flex-col'>
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
				{Object.entries(filteredCategories).map(([category, components]) => {
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
								onClick={() => toggleCategory(category as ComponentCategory)}
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
				})}
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
