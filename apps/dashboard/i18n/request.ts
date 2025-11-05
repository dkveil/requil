import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './i18n.config';

export default getRequestConfig(async () => {
	const store = await cookies();
	const locale = store.get('locale')?.value || defaultLocale;

	return {
		locale,
		messages: (await import(`../locales/${locale}`)).default,
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	};
});
