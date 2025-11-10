'use client';

import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { DataRenderer } from '@/components/data-renderer';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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
	const { templates, loading, error, loadTemplates } = useTemplateStore();

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
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{Array.isArray(data) &&
							data.map((template) => (
								<Link
									key={template.id}
									href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATE_EDITOR(
										workspaceSlug,
										template.id
									)}
									className='group'
								>
									<Card className='h-full transition-all hover:shadow-md hover:border-primary/50'>
										<CardHeader>
											<div className='flex items-start justify-between'>
												<div className='flex items-center gap-3'>
													<div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
														<FileText className='size-5' />
													</div>
													<div>
														<CardTitle className='text-lg group-hover:text-primary transition-colors'>
															{template.name}
														</CardTitle>
														<CardDescription className='text-xs mt-1'>
															{t.updated}{' '}
															{new Date(template.updatedAt).toLocaleDateString(
																'en-US',
																{
																	month: 'short',
																	day: 'numeric',
																}
															)}
														</CardDescription>
													</div>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<p className='text-sm text-muted-foreground line-clamp-2'>
												{template.description || 'No description'}
											</p>
										</CardContent>
									</Card>
								</Link>
							))}
					</div>
				)}
			/>
		</div>
	);
}
