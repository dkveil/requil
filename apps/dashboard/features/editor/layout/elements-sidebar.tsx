'use client';

import type { ComponentCategory } from '@requil/types';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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
	const [searchQuery, setSearchQuery] = useState('');
	const [expandedCategories, setExpandedCategories] = useState<
		Set<ComponentCategory>
	>(new Set(['layout']));

	// Get all components grouped by category
	const componentsByCategory = CATEGORY_ORDER.reduce(
		(acc, category) => {
			const components = componentRegistry.getByCategory(category);
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
					Add Elements
				</h2>

				{/* Search */}
				<div className='relative'>
					<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						type='search'
						placeholder='Type to search'
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
									{CATEGORY_LABELS[category as ComponentCategory] || category}
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
										<button
											key={component.type}
											type='button'
											onClick={() => handleAddBlock(component.type)}
											className={cn(
												'p-3 rounded-md border border-border bg-background',
												'hover:border-primary hover:bg-muted/50',
												'transition-all duration-200',
												'flex flex-col items-center justify-center gap-2',
												'cursor-pointer group'
											)}
										>
											{/* Icon/Preview */}
											<div className='w-full h-12 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors'>
												<ComponentIcon type={component.type} />
											</div>

											{/* Name */}
											<span className='text-xs font-medium text-center text-foreground group-hover:text-primary transition-colors'>
												{component.name}
											</span>
										</button>
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

// Simple icon component for each block type
function ComponentIcon({ type }: { type: string }) {
	switch (type) {
		case 'Container':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Container icon</title>
					<rect
						x='4'
						y='4'
						width='16'
						height='16'
						rx='2'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Section':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Section icon</title>
					<rect
						x='3'
						y='8'
						width='18'
						height='8'
						rx='1'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Columns':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Columns icon</title>
					<rect
						x='4'
						y='6'
						width='6'
						height='12'
						rx='1'
						strokeWidth='1.5'
					/>
					<rect
						x='14'
						y='6'
						width='6'
						height='12'
						rx='1'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Column':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Column icon</title>
					<rect
						x='8'
						y='4'
						width='8'
						height='16'
						rx='1'
						strokeWidth='1.5'
					/>
				</svg>
			);
		case 'Spacer':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Spacer icon</title>
					<line
						x1='4'
						y1='12'
						x2='20'
						y2='12'
						strokeWidth='1.5'
						strokeDasharray='2 2'
					/>
				</svg>
			);
		case 'Divider':
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Divider icon</title>
					<line
						x1='4'
						y1='12'
						x2='20'
						y2='12'
						strokeWidth='2'
					/>
				</svg>
			);
		default:
			return (
				<svg
					className='w-6 h-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<title>Block icon</title>
					<rect
						x='6'
						y='6'
						width='12'
						height='12'
						rx='2'
						strokeWidth='1.5'
					/>
				</svg>
			);
	}
}
