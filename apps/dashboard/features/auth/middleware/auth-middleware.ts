import { type NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function verifySession(
	accessToken: string,
	refreshToken: string
): Promise<{ valid: boolean; shouldRefresh: boolean }> {
	try {
		const response = await fetch(`${API_URL}/api/auth/session`, {
			headers: {
				Cookie: `requil_access_token=${accessToken}; requil_refresh_token=${refreshToken}`,
			},
		});

		if (response.ok) {
			return { valid: true, shouldRefresh: false };
		}

		if (response.status === 401 && refreshToken) {
			return { valid: false, shouldRefresh: true };
		}

		return { valid: false, shouldRefresh: false };
	} catch {
		return { valid: false, shouldRefresh: false };
	}
}

async function refreshTokens(
	refreshToken: string
): Promise<{ success: boolean }> {
	try {
		const response = await fetch(`${API_URL}/api/auth/refresh`, {
			method: 'POST',
			headers: {
				Cookie: `requil_refresh_token=${refreshToken}`,
			},
		});

		return { success: response.ok };
	} catch {
		return { success: false };
	}
}

export async function authMiddleware(request: NextRequest) {
	const accessToken = request.cookies.get('requil_access_token')?.value;
	const refreshToken = request.cookies.get('requil_refresh_token')?.value;
	const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

	const hasAccessToken = Boolean(accessToken);
	const hasRefreshToken = Boolean(refreshToken);
	const hasAnyToken = hasAccessToken || hasRefreshToken;

	if (!hasAnyToken) {
		if (!isAuthRoute) {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
		return NextResponse.next();
	}

	const { valid, shouldRefresh } = await verifySession(
		accessToken || '',
		refreshToken || ''
	);

	const canRefresh = Boolean(refreshToken);
	const needsRefresh = !valid && shouldRefresh;

	if (needsRefresh && canRefresh && refreshToken) {
		const { success } = await refreshTokens(refreshToken);
		if (!success) {
			const response = NextResponse.redirect(
				new URL('/auth/login', request.url)
			);
			response.cookies.delete('requil_access_token');
			response.cookies.delete('requil_refresh_token');
			return response;
		}
	}

	const sessionExpired = !valid;
	const cannotRefresh = !shouldRefresh;

	if (sessionExpired && cannotRefresh) {
		const response = NextResponse.redirect(new URL('/auth/login', request.url));
		response.cookies.delete('requil_access_token');
		response.cookies.delete('requil_refresh_token');
		return response;
	}

	if (valid && isAuthRoute) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	return NextResponse.next();
}

export const authMiddlewareConfig = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
