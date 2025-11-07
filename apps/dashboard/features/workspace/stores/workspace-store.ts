import type { UserWorkspace } from '@requil/types/workspace';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
	getCookieValue,
	setCookieValue,
	deleteCookie,
	WORKSPACE_COOKIE,
} from '@/lib/cookies/cookie-utils';
import { workspaceApi } from '../api/workspace-api';

type WorkspaceState = {
	workspaces: UserWorkspace[];
	currentWorkspace: UserWorkspace | null;
	loading: boolean;
	error: string | null;
	initialized: boolean;
};

type WorkspaceActions = {
	loadWorkspaces: () => Promise<void>;
	setCurrentWorkspace: (workspace: UserWorkspace) => void;
	setCurrentWorkspaceById: (workspaceId: string) => void;
	setCurrentWorkspaceBySlug: (slug: string) => void;
	hasAccessToWorkspace: (workspaceId: string) => boolean;
	hasAccessToWorkspaceBySlug: (slug: string) => boolean;
	getRecommendedWorkspace: () => UserWorkspace | null;
	reset: () => void;
	hasWorkspace: () => boolean;
};

const getLastWorkspaceSlugFromCookie = (): string | null => {
	return getCookieValue(WORKSPACE_COOKIE.NAME);
};

const saveWorkspaceSlugToCookie = (slug: string): void => {
	setCookieValue(WORKSPACE_COOKIE.NAME, slug, {
		maxAge: WORKSPACE_COOKIE.MAX_AGE,
		path: WORKSPACE_COOKIE.PATH,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	});
};

const clearWorkspaceCookie = (): void => {
	deleteCookie(WORKSPACE_COOKIE.NAME, WORKSPACE_COOKIE.PATH);
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
	devtools(
		(set, get) => ({
			workspaces: [],
			currentWorkspace: null,
			loading: false,
			error: null,
			initialized: false,

			loadWorkspaces: async () => {
				set({ loading: true, error: null }, false, 'loadWorkspaces/start');

				try {
					const response = await workspaceApi.getUserWorkspaces();
					const workspaces = response.workspaces;

					// Get last viewed workspace from cookie (by slug)
					const lastViewedSlug = getLastWorkspaceSlugFromCookie();
					let currentWorkspace: UserWorkspace | null = null;

					if (lastViewedSlug) {
						currentWorkspace =
							workspaces.find((w) => w.slug === lastViewedSlug) || null;
					}

					// Fallback to first workspace if no cached workspace found
					if (!currentWorkspace && workspaces.length > 0) {
						currentWorkspace = workspaces[0] || null;
					}

					set(
						{
							workspaces,
							currentWorkspace,
							loading: false,
							error: null,
							initialized: true,
						},
						false,
						'loadWorkspaces/success'
					);
				} catch (error) {
					console.error('Failed to load workspaces', error);
					set(
						{
							workspaces: [],
							currentWorkspace: null,
							loading: false,
							error: 'Failed to load workspaces',
							initialized: true,
						},
						false,
						'loadWorkspaces/error'
					);
				}
			},

			setCurrentWorkspace: (workspace: UserWorkspace) => {
				const { workspaces } = get();

				const exists = workspaces.find((w) => w.id === workspace.id);
				if (!exists) {
					console.warn('Workspace not found in user workspaces', workspace.id);
					return;
				}

				// Save slug to cookie (not ID!)
				saveWorkspaceSlugToCookie(workspace.slug);

				set({ currentWorkspace: workspace }, false, 'setCurrentWorkspace');
			},

			setCurrentWorkspaceById: (workspaceId: string) => {
				const { workspaces, setCurrentWorkspace } = get();
				const workspace = workspaces.find((w) => w.id === workspaceId);

				if (!workspace) {
					console.warn('Workspace not found by ID', workspaceId);
					return;
				}

				setCurrentWorkspace(workspace);
			},

			setCurrentWorkspaceBySlug: (slug: string) => {
				const { workspaces, setCurrentWorkspace } = get();
				const workspace = workspaces.find((w) => w.slug === slug);

				if (!workspace) {
					console.warn('Workspace not found by slug', slug);
					return;
				}

				setCurrentWorkspace(workspace);
			},

			hasAccessToWorkspace: (workspaceId: string): boolean => {
				const { workspaces } = get();
				return workspaces.some((w) => w.id === workspaceId);
			},

			hasAccessToWorkspaceBySlug: (slug: string): boolean => {
				const { workspaces } = get();
				return workspaces.some((w) => w.slug === slug);
			},

			getRecommendedWorkspace: (): UserWorkspace | null => {
				const { workspaces } = get();

				if (workspaces.length === 0) return null;

				// Check if cached workspace (by slug) still exists
				const lastViewedSlug = getLastWorkspaceSlugFromCookie();
				if (lastViewedSlug) {
					const cached = workspaces.find((w) => w.slug === lastViewedSlug);
					if (cached) return cached;
				}

				// Fallback: first workspace
				return workspaces[0] || null;
			},

			reset: () => {
				clearWorkspaceCookie();
				set(
					{
						workspaces: [],
						currentWorkspace: null,
						loading: false,
						error: null,
						initialized: false,
					},
					false,
					'reset'
				);
			},

			hasWorkspace: () => {
				const state = get();
				return state.workspaces.length > 0;
			},
		}),
		{ name: 'WorkspaceStore' }
	)
);
