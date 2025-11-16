'use client';

import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { ArrowRight, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { DataRenderer } from '@/components/data-renderer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/features/workspace';
import { useTemplateStore } from '../stores/template-store';

type Props = {
	workspaceSlug: string;
	translations: {
		title: string;
		description: string;
		newTemplate: string;
		noTemplatesYet: string;
		noTemplatesDescription: string;
		createTemplate: string;
		updated: string;
	};
};

export function TemplatesList({ workspaceSlug, translations: t }: Props) {
	const { currentWorkspace } = useWorkspace();
	const { templates, error, loadTemplates } = useTemplateStore();

	useEffect(() => {
		if (currentWorkspace?.id) {
			loadTemplates(currentWorkspace.id);
		}
	}, [currentWorkspace?.id, loadTemplates]);

	if (!currentWorkspace) {
		return null;
	}

	return (
		<div className='mx-auto max-w-7xl flex flex-col gap-6 p-8'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>{t.title}</h1>
					<p className='text-muted-foreground mt-1'>{t.description}</p>
				</div>
				<Button asChild>
					<Link
						href={DASHBOARD_ROUTES.WORKSPACE.NEW_EMAIL_TEMPLATE(workspaceSlug)}
					>
						<Plus />
						{t.newTemplate}
					</Link>
				</Button>
			</div>

			<DataRenderer
				success={!error}
				error={error ? { message: error } : undefined}
				data={templates}
				emptyState={{
					title: t.noTemplatesYet,
					message: t.noTemplatesDescription,
					button: {
						text: t.createTemplate,
						link: DASHBOARD_ROUTES.WORKSPACE.NEW_EMAIL_TEMPLATE(workspaceSlug),
					},
				}}
				render={(data) => (
					<Card className='overflow-hidden'>
						<div className='divide-y divide-border'>
							{Array.isArray(data) &&
								data.map((template) => (
									<Link
										key={template.id}
										href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATE_EDITOR(
											workspaceSlug,
											template.id
										)}
										className='group block'
									>
										<div className='flex items-center gap-4 p-4 transition-colors hover:bg-muted/50'>
											<div className='flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors'>
												<FileText className='size-5' />
											</div>

											<div className='flex-1 min-w-0'>
												<div className='flex items-start justify-between gap-4'>
													<div className='flex-1 min-w-0'>
														<h3 className='font-semibold text-foreground group-hover:text-primary transition-colors truncate'>
															{template.name}
														</h3>
														<p className='text-sm text-muted-foreground line-clamp-1 mt-0.5'>
															{template.description || 'No description'}
														</p>
													</div>

													<div className='flex items-center gap-3 shrink-0'>
														<div className='text-right hidden sm:block'>
															<p className='text-xs text-muted-foreground'>
																{t.updated}
															</p>
															<p className='text-sm font-medium text-foreground mt-0.5'>
																{new Date(
																	template.updatedAt
																).toLocaleDateString('en-US', {
																	month: 'short',
																	day: 'numeric',
																	year: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit',
																})}
															</p>
														</div>

														<ArrowRight className='size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all' />
													</div>
												</div>

												<div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground sm:hidden'>
													<span>
														{new Date(template.updatedAt).toLocaleDateString(
															'en-US',
															{
																month: 'short',
																day: 'numeric',
																year: 'numeric',
																hour: '2-digit',
																minute: '2-digit',
															}
														)}
													</span>
												</div>
											</div>
										</div>
									</Link>
								))}
						</div>
					</Card>
				)}
			/>
		</div>
	);
}
