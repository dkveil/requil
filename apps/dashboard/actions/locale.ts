'use server';

import { cookies } from 'next/headers';
import { type Locale, locales } from '@/i18n/i18n.config';

export async function setLocale(locale: string) {
	if (!locales.includes(locale as Locale)) {
		throw new Error('Invalid locale');
	}

	const cookieStore = await cookies();
	cookieStore.set('locale', locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	});
}
