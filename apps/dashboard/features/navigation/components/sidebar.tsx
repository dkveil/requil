'use client';

import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ModeToggle } from '@/components/layout/theme-toggle';
import Logo from '@/components/logo';
import LogoSmall from '@/components/logo-small';
import { useWorkspace } from '@/features/workspace';
import { WorkspaceSwitcher } from '@/features/workspace/components/workspace-switcher';
import { cn } from '@/lib/utils';
import { MENU_SECTIONS } from '../constants/menu-structure';
import { useSidebar } from '../hooks/use-sidebar';
import { NavItem } from './nav-item';

export function Sidebar() {
	const { currentWorkspace } = useWorkspace();
	const { isCollapsed, toggle, setCollapsed } = useSidebar();
	const t = useTranslations('navigation');

	useEffect(() => {
		const storedValue = localStorage.getItem('sidebar-storage');
		const isFirstVisit = !storedValue;

		const handleResize = () => {
			const width = window.innerWidth;

			if (width < 1024) {
				setCollapsed(true);
			} else if (isFirstVisit && width >= 1024) {
				setCollapsed(false);
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [setCollapsed]);

	if (!currentWorkspace) {
		return null;
	}

	return (
		<aside
			className={cn(
				'fixed left-0 top-0 z-40 h-screen border-r bg-sidebar border-sidebar-border transition-all duration-300',
				isCollapsed ? 'w-16' : 'w-64'
			)}
		>
			<div className='flex h-full flex-col'>
				<div className='border-b border-sidebar-border p-4'>
					<Link
						href='/'
						className={cn(
							'flex items-center gap-2',
							isCollapsed && 'justify-center'
						)}
					>
						{isCollapsed && <LogoSmall />}
						{!isCollapsed && <Logo />}
					</Link>
				</div>

				<div className='border-b border-sidebar-border p-4'>
					<WorkspaceSwitcher isCollapsed={isCollapsed} />
				</div>

				<nav className='flex-1 overflow-y-auto p-4'>
					<div className='space-y-6'>
						{MENU_SECTIONS.map((section) => (
							<div
								key={section.title}
								className='space-y-1'
							>
								{!isCollapsed && (
									<h3 className='mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
										{t(`${section.title}.title`)}
									</h3>
								)}

								{section.items.map((item) => (
									<NavItem
										key={item.id}
										icon={item.icon}
										label={t(`${section.title}.items.${item.id}.title`)}
										href={item.route(currentWorkspace.slug)}
										description={t(
											`${section.title}.items.${item.id}.description`
										)}
										isCollapsed={isCollapsed}
									/>
								))}
							</div>
						))}
					</div>
				</nav>

				<div className='border-t border-sidebar-border p-4'>
					<div
						className={cn(
							'flex items-center',
							isCollapsed ? 'flex-col gap-2' : 'justify-between'
						)}
					>
						{!isCollapsed && (
							<p className='text-xs text-muted-foreground'>Requil Dashboard</p>
						)}
						<div
							className={cn(
								'flex items-center gap-1',
								isCollapsed && 'flex-col'
							)}
						>
							<ModeToggle iconClassName='h-[.85rem] w-[.85rem]' />
							<LanguageToggle iconClassName='h-[.85rem] w-[.85rem]' />
						</div>
					</div>
					<button
						type='button'
						onClick={toggle}
						className='mt-3 flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
						aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					>
						{isCollapsed ? (
							<ChevronRight className='h-5 w-5' />
						) : (
							<ChevronLeft className='h-5 w-5' />
						)}
					</button>
				</div>
			</div>
		</aside>
	);
}
