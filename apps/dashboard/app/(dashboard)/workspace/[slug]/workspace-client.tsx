'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useWorkspace } from '@/features/workspace';

type Props = {
	workspaceSlug: string;
	lastViewedSlug: string | null;
};

export function WorkspaceClient({ workspaceSlug, lastViewedSlug }: Props) {
	const router = useRouter();
	const {
		workspaces,
		currentWorkspace,
		initialized,
		loading,
		setCurrentWorkspaceBySlug,
		hasAccessToWorkspaceBySlug,
	} = useWorkspace();

	const [accessChecked, setAccessChecked] = useState(false);

	useEffect(() => {
		if (!initialized) return;

		const hasAccess = hasAccessToWorkspaceBySlug(workspaceSlug);

		if (!hasAccess) {
			router.replace('/welcome');
			return;
		}

		setCurrentWorkspaceBySlug(workspaceSlug);
		setAccessChecked(true);
	}, [
		workspaceSlug,
		initialized,
		hasAccessToWorkspaceBySlug,
		setCurrentWorkspaceBySlug,
		router,
	]);

	if (loading || !initialized || !accessChecked) {
		return <LoadingScreen text='Loading workspace...' />;
	}

	if (!currentWorkspace || currentWorkspace.slug !== workspaceSlug) {
		return <LoadingScreen text='Loading workspace...' />;
	}

	return (
		<div className='min-h-screen bg-gray-50 p-8'>
			<div className='mx-auto max-w-7xl'>
				<header className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900'>
						{currentWorkspace.name}
					</h1>
					<p className='mt-2 text-gray-600'>
						Slug: {currentWorkspace.slug} • ID: {currentWorkspace.id}
					</p>
				</header>

				<div className='rounded-lg bg-white p-8 shadow'>
					<h2 className='text-xl font-semibold text-gray-900'>
						Workspace Content
					</h2>
					<p className='mt-4 text-gray-600'>Workspace content here...</p>

					{process.env.NODE_ENV === 'development' && (
						<div className='mt-8 rounded bg-gray-100 p-4'>
							<h3 className='font-mono text-sm font-bold'>Debug Info:</h3>
							<pre className='mt-2 text-xs'>
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
