import { type NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function verifySession(token: string): Promise<boolean> {
	try {
		const response = await fetch(`${API_URL}/api/auth/session`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.ok;
	} catch {
		return false;
	}
}

export async function middleware(request: NextRequest) {
	const token = request.cookies.get('requil_access_token')?.value;
	const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

	if (!token) {
		if (!isAuthRoute) {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
		return NextResponse.next();
	}

	const isValid = await verifySession(token);

	if (!isValid) {
		const response = NextResponse.redirect(
			new URL('/auth/login', request.url)
		);
		response.cookies.delete('requil_access_token');
		response.cookies.delete('requil_refresh_token');
		return response;
	}

	if (isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
