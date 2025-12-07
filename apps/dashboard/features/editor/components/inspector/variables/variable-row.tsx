'use client';

import { Variable } from '@requil/types';
import { ChevronDown, ChevronRight, Copy, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariableRowProps {
	variable: Variable;
	previewValue: string;
	onPreviewChange: (value: string) => void;
	onUpdate: (updates: Partial<Variable>) => void;
	onRemove: () => void;
}

export function VariableRow({
	variable,
	previewValue,
	onPreviewChange,
	onUpdate,
	onRemove,
}: VariableRowProps) {
	const t = useTranslations('editor.settingsSidebar.variablesPanel');
	const [isExpanded, setIsExpanded] = useState(false);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(`{{${variable.name}}}`);
		toast.success(t('copyToast', { name: variable.name }));
	};

	return (
		<div className='border border-accent rounded bg-accent/20 transition-all'>
			<div
				className='flex items-center justify-between gap-2 p-3 cursor-pointer'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className='flex items-center gap-2 flex-1'>
					<button
						type='button'
						className='p-0.5 text-muted-foreground hover:text-foreground transition-colors'
						aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
					>
						{isExpanded ? (
							<ChevronDown className='h-3 w-3' />
						) : (
							<ChevronRight className='h-3 w-3' />
						)}
					</button>
					<span className='text-sm font-medium font-mono text-primary'>
						{variable.name}
					</span>
					{variable.label && variable.label !== variable.name && (
						<span className='text-xs text-muted-foreground'>
							({variable.label})
						</span>
					)}
				</div>
				<div className='flex items-center gap-1'>
					<Button
						variant='ghost'
						size='icon'
						className='h-6 w-6'
						onClick={handleCopy}
						title={t('copyTitle')}
					>
						<Copy className='h-3 w-3' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className='h-6 w-6 text-destructive hover:text-destructive'
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						title={t('removeTitle')}
					>
						<Trash2 className='h-3 w-3' />
					</Button>
				</div>
			</div>

			{isExpanded && (
				<div className='px-3 pb-3 space-y-3 border-t border-accent/50 pt-3'>
					<div className='space-y-1'>
						<Label
							htmlFor={`var-label-${variable.id}`}
							className='text-xs text-muted-foreground'
						>
							Label
						</Label>
						<Input
							id={`var-label-${variable.id}`}
							value={variable.label || ''}
							onChange={(e) => onUpdate({ label: e.target.value })}
							placeholder='Label'
							className='h-8 text-sm'
						/>
					</div>

					<div className='space-y-1'>
						<Label
							htmlFor={`var-default-${variable.id}`}
							className='text-xs text-muted-foreground'
						>
							Default Value
						</Label>
						<Input
							id={`var-default-${variable.id}`}
							value={variable.defaultValue || ''}
							onChange={(e) => onUpdate({ defaultValue: e.target.value })}
							placeholder='Default value'
							className='h-8 text-sm'
						/>
					</div>

					<div className='space-y-1'>
						<Label
							htmlFor={`var-${variable.id}`}
							className='text-xs text-muted-foreground'
						>
							{t('dummyData')}
						</Label>
						<Input
							id={`var-${variable.id}`}
							value={previewValue || ''}
							onChange={(e) => onPreviewChange(e.target.value)}
							placeholder={variable.defaultValue || t('dummyDataPlaceholder')}
							className='h-8 text-sm'
						/>
					</div>
				</div>
			)}
		</div>
	);
}
