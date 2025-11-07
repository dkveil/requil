import type { UserWorkspace } from '@requil/types/workspace';
import { useCallback } from 'react';
import { useWorkspaceStore } from '../stores/workspace-store';

export function useWorkspace() {
	// State selectors
	const workspaces = useWorkspaceStore((state) => state.workspaces);
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const loading = useWorkspaceStore((state) => state.loading);
	const initialized = useWorkspaceStore((state) => state.initialized);
	const error = useWorkspaceStore((state) => state.error);

	// Actions
	const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
	const setCurrentWorkspace = useWorkspaceStore(
		(state) => state.setCurrentWorkspace
	);
	const setCurrentWorkspaceById = useWorkspaceStore(
		(state) => state.setCurrentWorkspaceById
	);
	const setCurrentWorkspaceBySlug = useWorkspaceStore(
		(state) => state.setCurrentWorkspaceBySlug
	);
	const hasAccessToWorkspace = useWorkspaceStore(
		(state) => state.hasAccessToWorkspace
	);
	const hasAccessToWorkspaceBySlug = useWorkspaceStore(
		(state) => state.hasAccessToWorkspaceBySlug
	);
	const reset = useWorkspaceStore((state) => state.reset);

	// Computed values
	const hasWorkspaces = workspaces.length > 0;
	const recommendedWorkspace = useWorkspaceStore((state) =>
		state.getRecommendedWorkspace()
	);

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
