'use client';

import { LoadingScreen } from '@/components/loading-screen';
import EditorLayout from '@/features/editor/layout/editor-layout';
import { useWorkspaceAccess } from '@/features/workspace/hooks/use-workspace-access';

type Props = {
	workspaceSlug: string;
};

export function EditorClient({ workspaceSlug }: Props) {
	const { accessChecked } = useWorkspaceAccess(workspaceSlug);

	if (!accessChecked) {
		return <LoadingScreen text='Loading editor...' />;
	}

	return (
		<EditorLayout>
			<div>EditorClient</div>
		</EditorLayout>
	);
}
