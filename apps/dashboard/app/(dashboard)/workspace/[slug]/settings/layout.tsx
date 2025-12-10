import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { SettingsSidebarClient } from '@/features/settings/components/settings-sidebar-client';

type SettingsLayoutProps = {
	children: React.ReactNode;
	params: Promise<{
		slug: string;
	}>;
};

export default async function SettingsLayout({
	children,
	params,
}: SettingsLayoutProps) {
	if (process.env.NODE_ENV === 'development') {
		await new Promise((resolve) => setTimeout(resolve, 800));
	}

	const { slug } = await params;
	const t = await getTranslations('settings.navigation');

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
				<SettingsSidebarClient slug={slug} />
				<main className='flex-1'>{children}</main>
			</div>
		</div>
	);
}
