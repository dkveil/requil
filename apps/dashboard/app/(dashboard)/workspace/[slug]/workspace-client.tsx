'use client';

import { LoadingScreen } from '@/components/loading-screen';
import { useWorkspace } from '@/features/workspace';
import { useWorkspaceAccess } from '@/features/workspace/hooks/use-workspace-access';

type Props = {
	workspaceSlug: string;
	lastViewedSlug: string | null;
};

export function WorkspaceClient({ workspaceSlug, lastViewedSlug }: Props) {
	const { currentWorkspace, workspaces } = useWorkspace();
	const { accessChecked } = useWorkspaceAccess(workspaceSlug);

	if (!(accessChecked && currentWorkspace)) {
		return <LoadingScreen text='Loading workspace...' />;
	}

	return (
		<div className='bg-background p-8'>
			<div className='mx-auto max-w-7xl'>
				<header className='mb-8'>
					<h1 className='text-3xl font-bold text-foreground'>
						{currentWorkspace.name}
					</h1>
					<p className='mt-2 text-muted-foreground'>
						Slug: {currentWorkspace.slug} • ID: {currentWorkspace.id}
					</p>
				</header>

				<div className='rounded-lg bg-card p-8 shadow'>
					<h2 className='text-xl font-semibold text-card-foreground'>
						Workspace Content
					</h2>
					<p className='mt-4 text-muted-foreground'>
						Workspace content here...
					</p>

					{process.env.NODE_ENV === 'development' && (
						<div className='mt-8 rounded bg-muted p-4'>
							<h3 className='font-mono text-sm font-bold text-foreground'>
								Debug Info:
							</h3>
							<pre className='mt-2 text-xs text-muted-foreground'>
								{JSON.stringify(
									{
										currentWorkspace,
										lastViewedSlug,
										workspacesCount: workspaces.length,
									},
									null,
									2
								)}
							</pre>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
