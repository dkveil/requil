import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ACCESS_COOKIE_NAME = 'requil_beta_access';
const PUBLIC_ROUTES = ['/access'];

export function accessMiddleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	if (pathname.startsWith('/_next') || pathname.startsWith('/api/_next')) {
		return NextResponse.next();
	}

	const hasAccess =
		request.cookies.get(ACCESS_COOKIE_NAME)?.value === 'granted';

	if (!hasAccess) {
		const url = request.nextUrl.clone();
		url.pathname = '/access';
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}
