import type { UserWorkspace } from '@requil/types/workspace';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { workspaceApi } from '../api/workspace-api';

type WorkspaceState = {
	workspaces: UserWorkspace[];
	currentWorkspace: UserWorkspace | null;
	loading: boolean;
	initialized: boolean;
};

type WorkspaceActions = {
	loadWorkspaces: () => Promise<void>;
	setCurrentWorkspace: (workspace: UserWorkspace) => void;
	hasWorkspace: () => boolean;
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
	devtools(
		(set, get) => ({
			workspaces: [],
			currentWorkspace: null,
			loading: false,
			initialized: false,

			loadWorkspaces: async () => {
				set({ loading: true }, false, 'loadWorkspaces/start');

				try {
					const response = await workspaceApi.getUserWorkspaces();
					const workspaces = response.workspaces;

					set(
						{
							workspaces,
							currentWorkspace: workspaces[0] || null,
							loading: false,
							initialized: true,
						},
						false,
						'loadWorkspaces'
					);
				} catch {
					set(
						{
							workspaces: [],
							currentWorkspace: null,
							loading: false,
							initialized: true,
						},
						false,
						'loadWorkspaces/error'
					);
				}
			},

			setCurrentWorkspace: (workspace: UserWorkspace) => {
				set({ currentWorkspace: workspace }, false, 'setCurrentWorkspace');
			},

			hasWorkspace: () => {
				const state = get();
				return state.workspaces.length > 0;
			},
		}),
		{ name: 'WorkspaceStore' }
	)
);
