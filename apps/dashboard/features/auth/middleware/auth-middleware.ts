import { API_ROUTES } from '@requil/utils/api-routes';
import { type NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8121/api';

async function verifySession(
	cookies: string
): Promise<{ valid: boolean; shouldRefresh: boolean }> {
	try {
		const response = await fetch(`${API_URL}${API_ROUTES.AUTH.SESSION}`, {
			headers: {
				Cookie: cookies,
			},
		});

		if (response.ok) {
			return { valid: true, shouldRefresh: false };
		}

		if (response.status === 401) {
			return { valid: false, shouldRefresh: true };
		}

		return { valid: false, shouldRefresh: false };
	} catch {
		return { valid: false, shouldRefresh: false };
	}
}

async function refreshTokens(cookies: string): Promise<{
	success: boolean;
	newCookies?: string[];
}> {
	try {
		const response = await fetch(`${API_URL}${API_ROUTES.AUTH.REFRESH}`, {
			method: 'POST',
			headers: {
				Cookie: cookies,
			},
		});

		if (response.ok) {
			const setCookieHeaders = response.headers.getSetCookie();
			return { success: true, newCookies: setCookieHeaders };
		}

		return { success: false };
	} catch {
		return { success: false };
	}
}

function getCookieString(request: NextRequest): string {
	return request.cookies
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ');
}

function parseCookies(
	setCookieHeaders: string[]
): Map<string, { value: string; options: string }> {
	const cookies = new Map<string, { value: string; options: string }>();

	for (const header of setCookieHeaders) {
		const [cookiePair, ...options] = header.split(';');
		if (!cookiePair) continue;

		const [name, value] = cookiePair.split('=');
		if (name && value) {
			cookies.set(name.trim(), {
				value: value.trim(),
				options: options.join(';'),
			});
		}
	}

	return cookies;
}

export async function authMiddleware(request: NextRequest) {
	const accessToken = request.cookies.get('requil_access_token')?.value;
	const refreshToken = request.cookies.get('requil_refresh_token')?.value;
	const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

	const hasAnyToken = Boolean(accessToken) || Boolean(refreshToken);

	if (!hasAnyToken) {
		if (!isAuthRoute) {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
		return NextResponse.next();
	}

	const cookieString = getCookieString(request);
	const { valid, shouldRefresh } = await verifySession(cookieString);

	if (!valid && shouldRefresh && refreshToken) {
		const { success, newCookies } = await refreshTokens(cookieString);
		if (!success) {
			const response = NextResponse.redirect(
				new URL('/auth/login', request.url)
			);
			response.cookies.delete('requil_access_token');
			response.cookies.delete('requil_refresh_token');
			return response;
		}

		const response = isAuthRoute
			? NextResponse.redirect(new URL('/', request.url))
			: NextResponse.next();

		if (newCookies && newCookies.length > 0) {
			const parsedCookies = parseCookies(newCookies);

			parsedCookies.forEach((cookie, name) => {
				response.cookies.set(name, cookie.value, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
				});
			});
		}

		return response;
	}

	if (!valid) {
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
