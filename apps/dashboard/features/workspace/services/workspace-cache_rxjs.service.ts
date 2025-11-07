import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
	deleteCookie,
	getCookieValue,
	setCookieValue,
	WORKSPACE_COOKIE,
} from '@/lib/cookies/cookie-utils';

class WorkspaceCacheService {
	private lastWorkspaceId$ = new BehaviorSubject<string | null>(
		this.getFromCookie()
	);

	private pollingInterval: NodeJS.Timeout | null = null;

	get lastWorkspaceId(): Observable<string | null> {
		return this.lastWorkspaceId$.asObservable().pipe(distinctUntilChanged());
	}

	get currentValue(): string | null {
		return this.lastWorkspaceId$.value;
	}

	private getFromCookie(): string | null {
		return getCookieValue(WORKSPACE_COOKIE.NAME);
	}

	setLastWorkspace(workspaceId: string): void {
		if (typeof window === 'undefined') return;

		setCookieValue(WORKSPACE_COOKIE.NAME, workspaceId, {
			maxAge: WORKSPACE_COOKIE.MAX_AGE,
			path: WORKSPACE_COOKIE.PATH,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		});

		this.lastWorkspaceId$.next(workspaceId);
	}

	clear(): void {
		if (typeof window === 'undefined') return;

		deleteCookie(WORKSPACE_COOKIE.NAME, WORKSPACE_COOKIE.PATH);
		this.lastWorkspaceId$.next(null);
	}

	startPolling(intervalMs = 1000): void {
		if (typeof window === 'undefined') return;
		if (this.pollingInterval) return;

		this.pollingInterval = setInterval(() => {
			const currentValue = this.getFromCookie();
			if (currentValue !== this.lastWorkspaceId$.value) {
				this.lastWorkspaceId$.next(currentValue);
			}
		}, intervalMs);
	}

	stopPolling(): void {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
		}
	}

	destroy(): void {
		this.stopPolling();
		this.lastWorkspaceId$.complete();
	}
}

export const workspaceCacheService = new WorkspaceCacheService();

if (typeof window !== 'undefined') {
	workspaceCacheService.startPolling(1000);
}
