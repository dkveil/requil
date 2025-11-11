'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyControl } from '../components/inspector/property-control';
import { Section } from '../components/inspector/section';
import { SpacingEditor } from '../components/inspector/spacing-editor';
import { useCanvas } from '../hooks/use-canvas';
import { componentRegistry } from '../registry/component-registry';

export function SettingsSidebar() {
	const t = useTranslations('editor.settingsSidebar');
	const { selectedBlock, document, updateBlock } = useCanvas();
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(['spacing', 'typography', 'fill', 'style'])
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
		updateBlock(blockToEdit.id, {
			props: {
				...blockToEdit.props,
				[propName]: value,
			},
		});
	};

	return (
		<div className='w-80 border-l h-full bg-card flex flex-col overflow-hidden'>
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
							<div className='space-y-2'>
								<Label className='text-xs text-muted-foreground'>
									{t('blockType')}
								</Label>
								<Select
									value={blockToEdit.type}
									disabled
								>
									<SelectTrigger className='w-full'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={blockToEdit.type}>
											{blockToEdit.type}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</Section>

						{/* Render Groups from Inspector Config */}
						{componentDef?.inspectorConfig?.groups?.map((group) => {
							const groupFields = componentDef.inspectorConfig?.fields.filter(
								(field) => group.fields.includes(field.key)
							);

							if (!groupFields || groupFields.length === 0) return null;

							// Special handling for spacing group
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

							// Render other groups
							return (
								<Section
									key={group.id}
									title={group.label}
									isExpanded={expandedSections.has(group.id)}
									onToggle={() => toggleSection(group.id)}
								>
									<div className='space-y-3'>
										{groupFields.map((field) => {
											const value = blockToEdit.props[field.key];
											if (value === undefined) return null;

											return (
												<PropertyControl
													key={field.key}
													field={field}
													value={value}
													onChange={(newValue) =>
														handlePropChange(field.key, newValue)
													}
												/>
											);
										})}
									</div>
								</Section>
							);
						})}

						{/* Fallback: Ungrouped Properties */}
						{componentDef?.inspectorConfig?.fields
							.filter(
								(field) =>
									!componentDef.inspectorConfig?.groups?.some((g) =>
										g.fields.includes(field.key)
									)
							)
							.map((field) => {
								const value = blockToEdit.props[field.key];
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
