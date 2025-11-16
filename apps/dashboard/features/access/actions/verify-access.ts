'use server';

import { cookies } from 'next/headers';

const BETA_ACCESS_CODE = 'REQUIL_BETA_2025_XK9P7M';
const ACCESS_COOKIE_NAME = 'requil_beta_access';

export async function verifyAccessCode(code: string) {
	if (code?.trim().toUpperCase() === BETA_ACCESS_CODE) {
		const cookieStore = await cookies();
		
		cookieStore.set(ACCESS_COOKIE_NAME, 'granted', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 90,
			path: '/',
		});

		return { success: true };
	}

	return { success: false };
}

