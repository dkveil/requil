'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useCanvasStore } from '@/features/editor/store/canvas-store';
import { Section } from '../section';
import { VariableRow } from './variable-row';

export function VariablesPanel() {
	const t = useTranslations('editor.settingsSidebar.variablesPanel');
	const {
		document,
		previewMode,
		previewData,
		setPreviewMode,
		setPreviewData,
		addVariable,
		removeVariable,
		updateVariable,
	} = useCanvasStore();

	const [newVarName, setNewVarName] = useState('');
	const [isListExpanded, setIsListExpanded] = useState(true);

	const handleAdd = () => {
		if (!newVarName.trim()) return;

		const sanitizedName = newVarName.trim().replace(/[^a-zA-Z0-9_]/g, '');

		if (!sanitizedName) return;

		const currentVariables = document?.variables || [];
		if (currentVariables.some((v) => v.name === sanitizedName)) {
			toast.error(t('variableExists'));
			return;
		}

		addVariable({
			id: crypto.randomUUID(),
			name: sanitizedName,
			label: sanitizedName, // Default label = name
			defaultValue: '',
		});

		setNewVarName('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleAdd();
		}
	};

	const variables = document?.variables || [];

	return (
		<div className='flex flex-col h-full overflow-hidden'>
			<div className='p-4 border-b flex items-center justify-between bg-muted/20 shrink-0'>
				<div className='space-y-0.5'>
					<Label className='text-sm font-medium'>{t('previewMode')}</Label>
					<p className='text-xs text-muted-foreground'>
						{t('previewModeDescription')}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<span className='text-xs text-muted-foreground'>
						{previewMode ? t('on') : t('off')}
					</span>
					<Switch
						checked={previewMode}
						onCheckedChange={setPreviewMode}
					/>
				</div>
			</div>

			{/* List of Variables */}
			<ScrollArea className='flex-1'>
				<div className='p-4'>
					<Section
						title={t('definedVariables')}
						isExpanded={isListExpanded}
						onToggle={() => setIsListExpanded(!isListExpanded)}
					>
						{variables.length === 0 ? (
							<div className='text-center py-4 text-muted-foreground text-sm'>
								{t('noVariables')}
								<br />
								{t('addOneToStart')}
							</div>
						) : (
							<div className='space-y-3'>
								{variables.map((variable) => (
									<VariableRow
										key={variable.id}
										variable={variable}
										previewValue={previewData[variable.name] || ''}
										onPreviewChange={(val) =>
											setPreviewData(variable.name, val)
										}
										onUpdate={(updates) => updateVariable(variable.id, updates)}
										onRemove={() => removeVariable(variable.id)}
									/>
								))}
							</div>
						)}
					</Section>
				</div>
			</ScrollArea>

			{/* Add New Variable Form */}
			<div className='p-4 border-t bg-card mt-auto shrink-0'>
				<Label className='text-xs font-semibold mb-2 block'>
					{t('addNewVariable')}
				</Label>
				<div className='flex gap-2'>
					<Input
						value={newVarName}
						onChange={(e) => setNewVarName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={t('variableNamePlaceholder')}
						className='h-8'
					/>
					<Button
						onClick={handleAdd}
						size='sm'
						className='h-8 px-3'
						disabled={!newVarName.trim()}
					>
						<Plus className='h-4 w-4' />
					</Button>
				</div>
				<p className='text-[10px] text-muted-foreground mt-2'>
					{t.rich('helperText', {
						codeTag: (chunks) => (
							<code className='bg-muted px-1 rounded'>{chunks}</code>
						),
						example: '{{name}}',
					})}
				</p>
			</div>
		</div>
	);
}
