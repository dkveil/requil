'use client';

import * as LucideIcons from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyControl } from '../components/inspector/property-control';
import { Section } from '../components/inspector/section';
import { SpacingEditor } from '../components/inspector/spacing-editor';
import { useCanvas } from '../hooks/use-canvas';
import { getNestedValue, isFieldVisible } from '../lib/field-utils';
import { componentRegistry } from '../registry/component-registry';

const setNestedValue = (
	obj: Record<string, any>,
	path: string,
	value: any
): Record<string, any> => {
	const keys = path.split('.');
	const lastKey = keys.pop()!;
	const result = { ...obj };
	let current = result;

	for (const key of keys) {
		if (!current[key] || typeof current[key] !== 'object') {
			current[key] = {};
		} else {
			current[key] = { ...current[key] };
		}
		current = current[key];
	}

	current[lastKey] = value;
	return result;
};

export function SettingsSidebar() {
	const t = useTranslations('editor.settingsSidebar');
	const { selectedBlock, document, updateBlock } = useCanvas();
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(['selector', 'content', 'spacing', 'typography', 'fill', 'style'])
	);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => {
			const next = new Set(prev);
			if (next.has(section)) {
				next.delete(section);
			} else {
				next.add(section);
			}
			return next;
		});
	};

	// If no block is selected, show Root properties
	const blockToEdit = selectedBlock || document?.root;

	if (!blockToEdit) {
		return (
			<div className='w-80 border-l h-full bg-card flex items-center justify-center'>
				<p className='text-sm text-muted-foreground text-center px-4'>
					{t('noBlockSelected')}
				</p>
			</div>
		);
	}

	const componentDef = componentRegistry.get(blockToEdit.type);

	const handlePropChange = (propName: string, value: unknown) => {
		if (propName.includes('.')) {
			const updatedProps = setNestedValue(
				{ ...blockToEdit.props },
				propName,
				value
			);
			updateBlock(blockToEdit.id, {
				props: updatedProps,
			});
		} else {
			updateBlock(blockToEdit.id, {
				props: {
					...blockToEdit.props,
					[propName]: value,
				},
			});
		}
	};

	const handleNameChange = (value: string) => {
		updateBlock(blockToEdit.id, {
			name: value || undefined,
		});
	};

	return (
		<div className='w-80 border-l h-[calc(100%-49px)] bg-card flex flex-col overflow-auto pb-5'>
			{/* Tabs */}
			<Tabs
				defaultValue='layout'
				className='flex-1 flex flex-col'
			>
				<TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0'>
					<TabsTrigger
						value='layout'
						className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
					>
						{t('tabs.layout')}
					</TabsTrigger>
					<TabsTrigger
						value='animation'
						className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
					>
						{t('tabs.animation')}
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value='layout'
					className='flex-1 overflow-auto mt-0'
				>
					<div className='p-4 space-y-4'>
						{/* Selector Section */}
						<Section
							title={t('sections.selector')}
							isExpanded={expandedSections.has('selector')}
							onToggle={() => toggleSection('selector')}
							showToggle={false}
						>
							<div className='space-y-3'>
								{/* Block Info Card */}
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										{componentDef?.icon &&
											(() => {
												const IconComponent = (LucideIcons as any)[
													componentDef.icon
												];
												return IconComponent ? (
													<IconComponent className='h-4 w-4 text-muted-foreground' />
												) : null;
											})()}
										<div className='flex-1'>
											<div className='text-xs text-muted-foreground'>
												{componentDef?.category === 'content'
													? 'Content'
													: 'Layout'}
											</div>
											<div className='text-sm font-medium'>
												{componentDef?.name || blockToEdit.type}
											</div>
										</div>
									</div>
									{componentDef?.description && (
										<div className='text-xs text-muted-foreground'>
											{componentDef.description}
										</div>
									)}
								</div>

								{/* Block Name */}
								<div className='space-y-1.5'>
									<Label className='text-xs text-muted-foreground'>
										{t('blockName')}
									</Label>
									<Input
										value={blockToEdit.name || ''}
										onChange={(e) => handleNameChange(e.target.value)}
										placeholder={componentDef?.name || blockToEdit.type}
										className='h-8 text-sm bg-accent/50'
									/>
								</div>
							</div>
						</Section>

						{componentDef?.inspectorConfig?.groups?.map((group) => {
							const groupFields = componentDef.inspectorConfig?.fields.filter(
								(field) =>
									group.fields.includes(field.key) &&
									isFieldVisible(field, blockToEdit.props)
							);

							if (!groupFields || groupFields.length === 0) return null;

							if (group.id === 'spacing') {
								const hasSpacing =
									blockToEdit.props.paddingTop !== undefined ||
									blockToEdit.props.paddingBottom !== undefined ||
									blockToEdit.props.paddingLeft !== undefined ||
									blockToEdit.props.paddingRight !== undefined;

								if (!hasSpacing) return null;

								return (
									<Section
										key={group.id}
										title={group.label}
										isExpanded={expandedSections.has(group.id)}
										onToggle={() => toggleSection(group.id)}
									>
										<SpacingEditor
											paddingTop={(blockToEdit.props.paddingTop as number) || 0}
											paddingBottom={
												(blockToEdit.props.paddingBottom as number) || 0
											}
											paddingLeft={
												(blockToEdit.props.paddingLeft as number) || 0
											}
											paddingRight={
												(blockToEdit.props.paddingRight as number) || 0
											}
											onPaddingChange={(side, value) => {
												handlePropChange(`padding${side}`, value);
											}}
										/>
									</Section>
								);
							}

							return (
								<Section
									key={group.id}
									title={group.label}
									isExpanded={expandedSections.has(group.id)}
									onToggle={() => toggleSection(group.id)}
								>
									<div className='space-y-3'>
										{groupFields.map((field) => {
											const value = field.key.includes('.')
												? getNestedValue(blockToEdit.props, field.key)
												: blockToEdit.props[field.key];

											if (value === undefined) return null;

											return (
												<PropertyControl
													key={field.key}
													field={field}
													value={value}
													onChange={(newValue) =>
														handlePropChange(field.key, newValue)
													}
													allValues={blockToEdit.props}
												/>
											);
										})}
									</div>
								</Section>
							);
						})}

						{componentDef?.inspectorConfig?.fields
							.filter(
								(field) =>
									!componentDef.inspectorConfig?.groups?.some((g) =>
										g.fields.includes(field.key)
									) && isFieldVisible(field, blockToEdit.props)
							)
							.map((field) => {
								const value = field.key.includes('.')
									? getNestedValue(blockToEdit.props, field.key)
									: blockToEdit.props[field.key];

								if (value === undefined) return null;

								return (
									<Section
										key={field.key}
										title={field.label}
										isExpanded={expandedSections.has(field.key)}
										onToggle={() => toggleSection(field.key)}
									>
										<PropertyControl
											field={field}
											value={value}
											onChange={(newValue) =>
												handlePropChange(field.key, newValue)
											}
											allValues={blockToEdit.props}
										/>
									</Section>
								);
							})}
					</div>
				</TabsContent>

				<TabsContent
					value='animation'
					className='flex-1 overflow-auto mt-0'
				>
					<div className='p-4'>
						<p className='text-sm text-muted-foreground'>
							{t('animationComingSoon')}
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
