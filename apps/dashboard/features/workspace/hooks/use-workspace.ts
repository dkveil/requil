import type { UserWorkspace } from '@requil/types/workspace';
import { useCallback } from 'react';
import { useObservable } from '@/lib/hooks/use-observable';
import { workspaceService } from '../services/workspace.service';

export function useWorkspace() {
	const workspaces = useObservable(workspaceService.workspaces$, []);
	const currentWorkspace = useObservable(
		workspaceService.currentWorkspace$,
		null
	);
	const loading = useObservable(workspaceService.loading$, false);
	const initialized = useObservable(workspaceService.initialized$, false);
	const error = useObservable(workspaceService.error$, null);
	const recommendedWorkspace = useObservable(
		workspaceService.recommendedWorkspace$,
		null
	);

	const loadWorkspaces = useCallback(() => {
		workspaceService.loadWorkspaces().subscribe({
			error: (err) => console.error('Failed to load workspaces', err),
		});
	}, []);

	const setCurrentWorkspace = useCallback((workspace: UserWorkspace) => {
		workspaceService.setCurrentWorkspace(workspace);
	}, []);

	const setCurrentWorkspaceById = useCallback((workspaceId: string) => {
		workspaceService.setCurrentWorkspaceById(workspaceId);
	}, []);

	const setCurrentWorkspaceBySlug = useCallback((slug: string) => {
		workspaceService.setCurrentWorkspaceBySlug(slug);
	}, []);

	const hasAccessToWorkspace = useCallback((workspaceId: string): boolean => {
		return workspaceService.hasAccessToWorkspace(workspaceId);
	}, []);

	const hasAccessToWorkspaceBySlug = useCallback((slug: string): boolean => {
		return workspaceService.hasAccessToWorkspaceBySlug(slug);
	}, []);

	const reset = useCallback(() => {
		workspaceService.reset();
	}, []);

	const hasWorkspaces = workspaces.length > 0;

	return {
		// State
		workspaces,
		currentWorkspace,
		loading,
		initialized,
		error,
		recommendedWorkspace,
		hasWorkspaces,

		// Actions
		loadWorkspaces,
		setCurrentWorkspace,
		setCurrentWorkspaceById,
		setCurrentWorkspaceBySlug,
		hasAccessToWorkspace,
		hasAccessToWorkspaceBySlug,
		reset,
	};
}
