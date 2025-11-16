import type { NextRequest } from 'next/server';
import { accessMiddleware } from '@/features/access';
import { authMiddleware } from '@/features/auth';

export function middleware(request: NextRequest) {
	const accessResponse = accessMiddleware(request);
	if (accessResponse.status !== 200) {
		return accessResponse;
	}

	return authMiddleware(request);
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
