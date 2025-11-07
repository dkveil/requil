import { getLastWorkspaceIdServer } from '@/features/workspace/services/workspace-cache.server';
import { WorkspaceClient } from './workspace-client';

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function WorkspacePage({ params }: Props) {
	const { slug } = await params;

	const lastViewedSlug = await getLastWorkspaceIdServer();

	return (
		<WorkspaceClient
			workspaceSlug={slug}
			lastViewedSlug={lastViewedSlug}
			// workspace={workspace}
		/>
	);
}
