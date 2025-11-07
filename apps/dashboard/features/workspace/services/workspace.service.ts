import type { UserWorkspace } from '@requil/types';
import {
	BehaviorSubject,
	combineLatest,
	from,
	Observable,
	throwError,
} from 'rxjs';
import {
	catchError,
	distinctUntilChanged,
	map,
	shareReplay,
	tap,
} from 'rxjs/operators';
import { workspaceApi } from '../api/workspace-api';
import { workspaceCacheService } from './workspace-cache.service';

export type WorkspaceState = {
	workspaces: UserWorkspace[];
	currentWorkspace: UserWorkspace | null;
	loading: boolean;
	error: string | null;
	initialized: boolean;
};

const initialState: WorkspaceState = {
	workspaces: [],
	currentWorkspace: null,
	loading: false,
	error: null,
	initialized: false,
};

class WorkspaceService {
	private state$ = new BehaviorSubject<WorkspaceState>(initialState);

	readonly state: Observable<WorkspaceState> = this.state$
		.asObservable()
		.pipe(distinctUntilChanged());

	readonly workspaces$: Observable<UserWorkspace[]> = this.state.pipe(
		map((state) => state.workspaces),
		distinctUntilChanged()
	);

	readonly currentWorkspace$: Observable<UserWorkspace | null> =
		this.state.pipe(
			map((state) => state.currentWorkspace),
			distinctUntilChanged((a, b) => a?.id === b?.id)
		);

	readonly loading$: Observable<boolean> = this.state.pipe(
		map((state) => state.loading),
		distinctUntilChanged()
	);

	readonly error$: Observable<string | null> = this.state.pipe(
		map((state) => state.error),
		distinctUntilChanged()
	);

	readonly initialized$: Observable<boolean> = this.state.pipe(
		map((state) => state.initialized),
		distinctUntilChanged()
	);

	readonly lastViewedWorkspaceId$: Observable<string | null> =
		workspaceCacheService.lastWorkspaceId;
	setCurrentWorkspace(workspace: UserWorkspace): void {
		const currentState = this.state$.value;

		const exists = currentState.workspaces.find((w) => w.id === workspace.id);
		if (!exists) {
			console.warn('Workspace not found in user workspaces', workspace.id);
			return;
		}

		// Zapisz slug do cookie (nie ID!)
		workspaceCacheService.setLastWorkspace(workspace.slug);

		this.updateState({ currentWorkspace: workspace });
	}

	readonly recommendedWorkspace$: Observable<UserWorkspace | null> =
		combineLatest([this.workspaces$, this.lastViewedWorkspaceId$]).pipe(
			map(([workspaces, lastViewedSlug]) => {
				if (workspaces.length === 0) return null;

				// Sprawdź czy cached workspace (po slug) nadal istnieje
				if (lastViewedSlug) {
					const cached = workspaces.find((w) => w.slug === lastViewedSlug);
					if (cached) return cached;
				}

				// Fallback: pierwszy workspace
				return workspaces[0] || null;
			}),
			distinctUntilChanged((a, b) => a?.id === b?.id),
			shareReplay(1)
		);

	loadWorkspaces(): Observable<UserWorkspace[]> {
		this.updateState({ loading: true, error: null });

		return from(workspaceApi.getUserWorkspaces()).pipe(
			map((response) => response.workspaces),
			tap((workspaces) => {
				// Cookie przechowuje SLUG, nie ID
				const lastViewedSlug = workspaceCacheService.currentValue;
				let currentWorkspace: UserWorkspace | null = null;

				if (lastViewedSlug) {
					currentWorkspace =
						workspaces.find((w) => w.slug === lastViewedSlug) || null;
				}

				if (!currentWorkspace && workspaces.length > 0) {
					currentWorkspace = workspaces[0] || null;
				}

				this.updateState({
					workspaces,
					currentWorkspace,
					loading: false,
					initialized: true,
				});
			}),
			catchError((error) => {
				console.error('Failed to load workspaces', error);
				this.updateState({
					error: 'Failed to load workspaces',
					loading: false,
					initialized: true,
				});
				return throwError(() => error);
			})
		);
	}

	/**
	 * Ustaw workspace po ID (legacy support)
	 */
	setCurrentWorkspaceById(workspaceId: string): void {
		const currentState = this.state$.value;
		const workspace = currentState.workspaces.find((w) => w.id === workspaceId);

		if (!workspace) {
			console.warn('Workspace not found by ID', workspaceId);
			return;
		}

		this.setCurrentWorkspace(workspace);
	}

	/**
	 * Ustaw workspace po slug (recommended)
	 */
	setCurrentWorkspaceBySlug(slug: string): void {
		const currentState = this.state$.value;
		const workspace = currentState.workspaces.find((w) => w.slug === slug);

		if (!workspace) {
			console.warn('Workspace not found by slug', slug);
			return;
		}

		this.setCurrentWorkspace(workspace);
	}

	/**
	 * Sprawdź dostęp po ID (legacy support)
	 */
	hasAccessToWorkspace(workspaceId: string): boolean {
		const currentState = this.state$.value;
		return currentState.workspaces.some((w) => w.id === workspaceId);
	}

	/**
	 * Sprawdź dostęp po slug (recommended)
	 */
	hasAccessToWorkspaceBySlug(slug: string): boolean {
		const currentState = this.state$.value;
		return currentState.workspaces.some((w) => w.slug === slug);
	}

	/**
	 * Observable sprawdzenia dostępu po ID
	 */
	checkWorkspaceAccess$(workspaceId: string): Observable<boolean> {
		return this.workspaces$.pipe(
			map((workspaces) => workspaces.some((w) => w.id === workspaceId)),
			distinctUntilChanged()
		);
	}

	/**
	 * Observable sprawdzenia dostępu po slug
	 */
	checkWorkspaceAccessBySlug$(slug: string): Observable<boolean> {
		return this.workspaces$.pipe(
			map((workspaces) => workspaces.some((w) => w.slug === slug)),
			distinctUntilChanged()
		);
	}

	private updateState(partial: Partial<WorkspaceState>): void {
		this.state$.next({
			...this.state$.value,
			...partial,
		});
	}

	reset(): void {
		workspaceCacheService.clear();
		this.state$.next(initialState);
	}

	destroy(): void {
		this.state$.complete();
		workspaceCacheService.destroy();
	}

	getCurrentState(): WorkspaceState {
		return this.state$.value;
	}

	getCurrentWorkspace(): UserWorkspace | null {
		return this.state$.value.currentWorkspace;
	}
}

export const workspaceService = new WorkspaceService();

if (process.env.NODE_ENV === 'development') {
	if (typeof window !== 'undefined') {
		(window as any).__workspaceService = workspaceService;
	}
}
