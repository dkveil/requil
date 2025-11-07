import { cookies } from 'next/headers';
import { WORKSPACE_COOKIE } from '@/lib/cookies/cookie-utils';
import logger from '@/lib/logger';

export async function getLastWorkspaceIdServer(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		return cookieStore.get(WORKSPACE_COOKIE.NAME)?.value || null;
	} catch (error) {
		logger.error(error, 'Failed to get workspace cookie on server');
		return null;
	}
}

export async function setLastWorkspaceIdServer(
	workspaceId: string
): Promise<void> {
	try {
		const cookieStore = await cookies();
		cookieStore.set(WORKSPACE_COOKIE.NAME, workspaceId, {
			maxAge: WORKSPACE_COOKIE.MAX_AGE,
			path: WORKSPACE_COOKIE.PATH,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		});
	} catch (error) {
		logger.error(error, 'Failed to set workspace cookie on server');
	}
}

export async function clearLastWorkspaceIdServer(): Promise<void> {
	try {
		const cookieStore = await cookies();
		cookieStore.delete(WORKSPACE_COOKIE.NAME);
	} catch (error) {
		logger.error(error, 'Failed to clear workspace cookie on server');
	}
}
