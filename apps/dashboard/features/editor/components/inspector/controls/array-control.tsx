import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { isFieldVisible } from '../../../lib/field-utils';

interface ArrayControlProps {
	field: {
		key: string;
		label: string;
		children?: any[];
		itemTitle?: string;
		itemTitleKey?: string;
	};
	value: unknown;
	onChange: (value: unknown) => void;
	renderField: (
		field: any,
		value: unknown,
		onChange: (value: unknown) => void,
		allValues?: Record<string, any>
	) => React.ReactNode;
}

export function ArrayControl({
	field,
	value,
	onChange,
	renderField,
}: ArrayControlProps) {
	const arrayValue = (value as any[]) || [];
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const createDefaultItem = () => {
		const defaultItem: Record<string, any> = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
		};
		field.children?.forEach((child: any) => {
			if (child.type === 'color') {
				defaultItem[child.key] = '#000000';
			} else if (child.type === 'number' || child.type === 'slider') {
				defaultItem[child.key] = child.min || 0;
			} else if (child.type === 'select' && child.options?.[0]) {
				defaultItem[child.key] = child.options[0].value;
			} else {
				defaultItem[child.key] = '';
			}
		});
		return defaultItem;
	};

	const handleAddItem = () => {
		onChange([...arrayValue, createDefaultItem()]);
	};

	const handleRemoveItem = (index: number) => {
		const newArray = [...arrayValue];
		newArray.splice(index, 1);
		onChange(newArray);
	};

	const handleItemChange = (index: number, newItemValue: any) => {
		const newArray = [...arrayValue];
		newArray[index] = newItemValue;
		onChange(newArray);
	};

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = 'move';
		// Make the drag preview slightly transparent
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.style.opacity = '0.5';
		}
	};

	const handleDragEnd = (e: React.DragEvent) => {
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.style.opacity = '1';
		}
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';

		if (draggedIndex !== null && draggedIndex !== index) {
			setDragOverIndex(index);
		}
	};

	const handleDragLeave = () => {
		setDragOverIndex(null);
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();

		if (draggedIndex === null || draggedIndex === dropIndex) {
			setDragOverIndex(null);
			return;
		}

		const newArray = [...arrayValue];
		const [draggedItem] = newArray.splice(draggedIndex, 1);
		newArray.splice(dropIndex, 0, draggedItem);

		onChange(newArray);
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	return (
		<div className='space-y-2'>
			<div className='flex items-center justify-between'>
				<Label className='text-xs font-semibold text-foreground'>
					{field.label}
				</Label>
				<button
					type='button'
					onClick={handleAddItem}
					className='p-1 text-xs bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors rounded border border-accent'
					aria-label='Add item'
				>
					<Plus className='h-3 w-3' />
				</button>
			</div>

			{arrayValue.length === 0 ? (
				<div className='text-xs text-muted-foreground text-center py-4 border border-dashed border-accent rounded'>
					No items yet. Click + to add one.
				</div>
			) : (
				<div className='space-y-2'>
					{arrayValue.map((item, index) => (
						<div
							key={item.id || index}
							draggable
							onDragStart={(e) => handleDragStart(e, index)}
							onDragEnd={handleDragEnd}
							onDragOver={(e) => handleDragOver(e, index)}
							onDragLeave={handleDragLeave}
							onDrop={(e) => handleDrop(e, index)}
							className={`border border-accent rounded p-3 space-y-3 bg-accent/20 transition-all cursor-move ${
								draggedIndex === index ? 'opacity-50' : ''
							} ${
								dragOverIndex === index
									? 'border-primary border-2 bg-accent/40'
									: ''
							}`}
						>
							<div className='flex items-center justify-between gap-2 mb-2'>
								<div className='flex items-center gap-2'>
									<div className='p-0.5 text-muted-foreground cursor-grab active:cursor-grabbing'>
										<GripVertical className='h-3 w-3' />
									</div>
									<span className='text-xs font-medium text-muted-foreground'>
										{field.itemTitle || `#${index + 1}`}
										{field.itemTitleKey && item[field.itemTitleKey] && (
											<span className='ml-1 text-foreground'>
												{item[field.itemTitleKey]}
											</span>
										)}
									</span>
								</div>
								<button
									type='button'
									onClick={() => handleRemoveItem(index)}
									className='p-0.5 text-muted-foreground hover:text-destructive transition-colors'
									aria-label='Remove item'
								>
									<Trash2 className='h-3 w-3' />
								</button>
							</div>

							{field.children
								?.filter((childField: any) => isFieldVisible(childField, item))
								.map((childField: any) =>
									renderField(
										childField,
										item[childField.key],
										(newValue) => {
											handleItemChange(index, {
												...item,
												[childField.key]: newValue,
											});
										},
										item
									)
								)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
