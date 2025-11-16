'use client';

import {
	Construction,
	FileText,
	Key,
	Mail,
	Send,
	Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useTemplateStore } from '@/features/templates/stores/template-store';
import { useWorkspace } from '@/features/workspace';
import { useWorkspaceAccess } from '@/features/workspace/hooks/use-workspace-access';

type Props = {
	workspaceSlug: string;
	lastViewedSlug: string | null;
};

export function WorkspaceClient({ workspaceSlug, lastViewedSlug }: Props) {
	const t = useTranslations('workspace.overview');
	const tCommon = useTranslations('common');
	const { currentWorkspace, workspaces } = useWorkspace();
	const { accessChecked } = useWorkspaceAccess(workspaceSlug);
	const { templates, loadTemplates } = useTemplateStore();

	useEffect(() => {
		if (currentWorkspace?.id) {
			loadTemplates(currentWorkspace.id);
		}
	}, [currentWorkspace?.id, loadTemplates]);

	if (!(accessChecked && currentWorkspace)) {
		return <LoadingScreen text={tCommon('loading')} />;
	}

	const templatesCount = templates.length;
	const currentHour = new Date().getHours();
	const timeOfDay =
		currentHour < 12
			? t('greeting.morning')
			: currentHour < 18
				? t('greeting.afternoon')
				: t('greeting.evening');

	const getTemplateStatusText = () => {
		if (templatesCount === 0) return t('stats.templates.none');
		if (templatesCount === 1) return t('stats.templates.single');
		return t('stats.templates.multiple');
	};

	return (
		<div className='bg-background min-h-screen p-6 md:p-8'>
			<div className='mx-auto max-w-7xl space-y-8'>
				<header className='space-y-2'>
					<div className='flex items-center gap-3'>
						<Sparkles className='h-8 w-8 text-primary' />
						<h1 className='text-4xl font-bold text-foreground'>{timeOfDay}!</h1>
					</div>
					<p className='text-lg text-muted-foreground'>
						{t('workspaceLabel')}:{' '}
						<span className='font-medium'>{currentWorkspace.name}</span>
					</p>
				</header>

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					<Card className='transition-all hover:shadow-md'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								{t('stats.templates.title')}
							</CardTitle>
							<FileText className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-bold'>{templatesCount}</div>
							<p className='text-xs text-muted-foreground mt-1'>
								{getTemplateStatusText()}
							</p>
						</CardContent>
					</Card>

					<Card className='transition-all hover:shadow-md opacity-60'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								{t('stats.emailsSent.title')}
							</CardTitle>
							<Send className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-bold'>—</div>
							<p className='text-xs text-muted-foreground mt-1'>
								{t('stats.emailsSent.comingSoon')}
							</p>
						</CardContent>
					</Card>

					<Card className='transition-all hover:shadow-md opacity-60'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								{t('stats.apiRequests.title')}
							</CardTitle>
							<Key className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-bold'>—</div>
							<p className='text-xs text-muted-foreground mt-1'>
								{t('stats.apiRequests.comingSoon')}
							</p>
						</CardContent>
					</Card>
				</div>

				<Alert className='border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'>
					<Construction className='h-4 w-4 text-amber-600 dark:text-amber-500' />
					<AlertTitle className='text-amber-900 dark:text-amber-100'>
						{t('inDevelopment.title')}
					</AlertTitle>
					<AlertDescription className='text-amber-800 dark:text-amber-200'>
						<div className='mt-3 space-y-2'>
							<div className='flex items-start gap-2'>
								<Mail className='h-4 w-4 mt-0.5 shrink-0' />
								<div>
									<p className='font-medium'>
										{t('inDevelopment.emailSending.title')}
									</p>
									<p className='text-sm opacity-90'>
										{t('inDevelopment.emailSending.description')}
									</p>
								</div>
							</div>
							<div className='flex items-start gap-2'>
								<Send className='h-4 w-4 mt-0.5 shrink-0' />
								<div>
									<p className='font-medium'>
										{t('inDevelopment.emailTransport.title')}
									</p>
									<p className='text-sm opacity-90'>
										{t('inDevelopment.emailTransport.description')}
									</p>
								</div>
							</div>
							<div className='flex items-start gap-2'>
								<Key className='h-4 w-4 mt-0.5 shrink-0' />
								<div>
									<p className='font-medium'>
										{t('inDevelopment.apiKeyCompatibility.title')}
									</p>
									<p className='text-sm opacity-90'>
										{t('inDevelopment.apiKeyCompatibility.description')}
									</p>
								</div>
							</div>
						</div>
					</AlertDescription>
				</Alert>

				{process.env.NODE_ENV === 'development' && (
					<Card>
						<CardHeader>
							<CardTitle className='text-sm font-mono'>
								{t('debug.title')}
							</CardTitle>
							<CardDescription>{t('debug.description')}</CardDescription>
						</CardHeader>
						<CardContent>
							<pre className='text-xs text-muted-foreground overflow-auto'>
								{JSON.stringify(
									{
										workspaceId: currentWorkspace.id,
										workspaceSlug: currentWorkspace.slug,
										lastViewedSlug,
										workspacesCount: workspaces.length,
										templatesCount,
									},
									null,
									2
								)}
							</pre>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
