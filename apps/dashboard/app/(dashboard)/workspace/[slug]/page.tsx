import { getLastWorkspaceIdServer } from '@/features/workspace/services/workspace-cache.server';
import { generatePageMetadata } from '@/lib/metadata';
import { WorkspaceClient } from './workspace-client';

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata() {
	return generatePageMetadata('workspace');
}

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
