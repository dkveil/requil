import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type MetadataKey =
	| 'login'
	| 'register'
	| 'forgotPassword'
	| 'resetPassword'
	| 'dashboard'
	| 'welcome'
	| 'workspace'
	| 'templates'
	| 'templateNew'
	| 'templateEdit'
	| 'templateView'
	| 'settings'
	| 'settingsGeneral'
	| 'settingsDevelopers'
	| 'settingsTransport'
	| 'editor'
	| 'demo';

export async function generatePageMetadata(
	key: MetadataKey,
	customTitle?: string
): Promise<Metadata> {
	const t = await getTranslations('metadata');

	const title = customTitle || t(`title.${key}`);
	const description = t(`description.${key}`);

	return {
		title,
		description,
		icons: {
			icon: [
				{
					url: '/images/logo/logo-icon-black.ico',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/images/logo/logo-icon-white.ico',
					media: '(prefers-color-scheme: dark)',
				},
				{
					url: '/images/logo/logo-icon-black.webp',
					type: 'image/webp',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/images/logo/logo-icon-white.webp',
					type: 'image/webp',
					media: '(prefers-color-scheme: dark)',
				},
			],
			apple: [
				{
					url: '/images/logo/logo-icon-black.webp',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/images/logo/logo-icon-white.webp',
					media: '(prefers-color-scheme: dark)',
				},
			],
		},
		openGraph: {
			title,
			description,
			type: 'website',
			siteName: 'Requil',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
		},
	};
}

export async function generateDynamicMetadata(
	titleKey: MetadataKey,
	dynamicTitle: string
): Promise<Metadata> {
	const t = await getTranslations('metadata');

	const description = t(`description.${titleKey}`);

	return {
		title: dynamicTitle,
		description,
		icons: {
			icon: [
				{
					url: '/images/logo/logo-icon-black.ico',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/images/logo/logo-icon-white.ico',
					media: '(prefers-color-scheme: dark)',
				},
				{
					url: '/images/logo/logo-icon-black.webp',
					type: 'image/webp',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/images/logo/logo-icon-white.webp',
					type: 'image/webp',
					media: '(prefers-color-scheme: dark)',
				},
			],
			apple: [
				{
					url: '/images/logo/logo-icon-black.webp',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/images/logo/logo-icon-white.webp',
					media: '(prefers-color-scheme: dark)',
				},
			],
		},
		openGraph: {
			title: dynamicTitle,
			description,
			type: 'website',
			siteName: 'Requil',
		},
		twitter: {
			card: 'summary_large_image',
			title: dynamicTitle,
			description,
		},
	};
}
