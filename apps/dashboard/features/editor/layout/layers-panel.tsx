'use client';

import type { Block } from '@requil/types';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ComponentIcon } from '../components/component-icon';
import { useCanvas } from '../hooks/use-canvas';
import { componentRegistry } from '../registry/component-registry';

interface LayersPanelProps {
	className?: string;
}

export function LayersPanel({ className }: LayersPanelProps) {
	const t = useTranslations('editor.elementsSidebar.layers');
	const { document } = useCanvas();

	if (!document) {
		return (
			<div
				className={cn(
					'w-full h-full flex items-center justify-center',
					className
				)}
			>
				<p className='text-sm text-muted-foreground'>{t('noDocument')}</p>
			</div>
		);
	}

	return (
		<div className={cn('w-full h-full overflow-auto', className)}>
			<LayerTreeNode
				block={document.root}
				level={0}
			/>
		</div>
	);
}

interface LayerTreeNodeProps {
	block: Block;
	level: number;
}

function LayerTreeNode({ block, level }: LayerTreeNodeProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const {
		selectedBlockId,
		hoveredBlockId,
		selectBlock,
		hoverBlock,
		removeBlock,
		document,
	} = useCanvas();

	const component = componentRegistry.get(block.type);
	const hasChildren = block.children && block.children.length > 0;
	const isSelected = selectedBlockId === block.id;
	const isHovered = hoveredBlockId === block.id;
	const isRoot = document?.root.id === block.id;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		selectBlock(block.id);
	};

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isRoot) {
			removeBlock(block.id);
		}
	};

	const handleMouseEnter = () => {
		hoverBlock(block.id);
	};

	const handleMouseLeave = () => {
		hoverBlock(null);
	};

	return (
		<div>
			{/* Node */}
			<div
				className={cn(
					'group flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors',
					isSelected && 'bg-primary/10 hover:bg-primary/15',
					isHovered && !isSelected && 'bg-muted/70'
				)}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{/* Expand/Collapse Button */}
				<button
					type='button'
					onClick={handleToggle}
					className={cn(
						'flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors',
						!hasChildren && 'invisible'
					)}
				>
					{isExpanded ? (
						<ChevronDown className='w-3 h-3' />
					) : (
						<ChevronRight className='w-3 h-3' />
					)}
				</button>

				{/* Icon */}
				<div className='flex items-center justify-center w-4 h-4 text-muted-foreground'>
					<ComponentIcon
						type={block.type}
						className='w-3.5 h-3.5'
					/>
				</div>

				{/* Name */}
				<span
					className={cn(
						'flex-1 text-sm truncate',
						isSelected ? 'text-foreground font-medium' : 'text-foreground/80'
					)}
				>
					{block.name || component?.name || block.type}
				</span>

				{/* Delete Button */}
				{!isRoot && (
					<button
						type='button'
						onClick={handleDelete}
						className='opacity-0 group-hover:opacity-100 flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-destructive transition-all'
						aria-label='Delete block'
					>
						<Trash2 className='w-3.5 h-3.5' />
					</button>
				)}
			</div>

			{/* Children */}
			{hasChildren && isExpanded && (
				<div>
					{block.children!.map((child) => (
						<LayerTreeNode
							key={child.id}
							block={child}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}
