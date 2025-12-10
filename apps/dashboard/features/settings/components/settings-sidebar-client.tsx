'use client';

import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

type SettingsSidebarClientProps = {
	slug: string;
};

export function SettingsSidebarClient({ slug }: SettingsSidebarClientProps) {
	const t = useTranslations('settings.navigation');
	const pathname = usePathname();

	const settingsNav = [
		{
			value: 'general',
			label: t('general'),
			href: DASHBOARD_ROUTES.WORKSPACE.SETTINGS.GENERAL(slug),
		},
		{
			value: 'transport',
			label: t('transport'),
			href: DASHBOARD_ROUTES.WORKSPACE.SETTINGS.TRANSPORT(slug),
		},
		{
			value: 'developers',
			label: t('developers'),
			href: DASHBOARD_ROUTES.WORKSPACE.SETTINGS.DEVELOPERS(slug),
		},
	];

	return (
		<aside className='w-64 shrink-0'>
			<nav className='flex flex-col gap-1'>
				{settingsNav.map((item) => {
					const isActive = pathname === item.href;

					return (
						<Link
							key={item.value}
							href={item.href}
							className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
								isActive
									? 'bg-accent text-accent-foreground'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
