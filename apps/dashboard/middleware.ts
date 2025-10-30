import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl) {
		return NextResponse.redirect(new URL('/auth/login', request.url));
	}

	if (!supabaseAnonKey) {
		return NextResponse.redirect(new URL('/auth/login', request.url));
	}

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				response = NextResponse.next({
					request,
				});
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options);
				}
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

	if (!user) {
		if (!isAuthRoute) {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
	}

	if (user && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return response;
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
