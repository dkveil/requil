'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { SettingsSidebar } from '@/features/settings/components/settings-sidebar';

type SettingsLayoutProps = {
	children: React.ReactNode;
	params: {
		slug: string;
	};
};

export default function SettingsLayout({
	children,
	params,
}: SettingsLayoutProps) {
	const t = useTranslations('settings.navigation');

	return (
		<div className='flex h-full flex-col'>
			<div className='flex flex-col gap-4 px-8 py-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground'>{t('description')}</p>
				</div>
				<Separator />
			</div>

			<div className='flex flex-1 gap-8 px-8 pb-8'>
				<SettingsSidebar slug={params.slug} />
				<main className='flex-1'>{children}</main>
			</div>
		</div>
	);
}
