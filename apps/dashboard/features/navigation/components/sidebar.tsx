'use client';

import {
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	FileText,
	Headphones,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ModeToggle } from '@/components/layout/theme-toggle';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
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
				'sticky top-16 h-[calc(100vh-4rem)] z-40 border-r bg-sidebar border-sidebar-border transition-all duration-300',
				isCollapsed ? 'w-16' : 'w-64'
			)}
		>
			<div className='flex h-full flex-col'>
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

				<button
					type='button'
					onClick={toggle}
					className='absolute right-0 top-3/4 cursor-pointer z-50 flex h-8 w-4 -translate-y-1/2 translate-x-full items-center justify-center rounded-r-md border border-l-0 border-sidebar-border bg-sidebar hover:bg-sidebar-accent transition-colors'
					aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					{isCollapsed ? (
						<ChevronRight className='h-4 w-4 text-sidebar-foreground/60' />
					) : (
						<ChevronLeft className='h-4 w-4 text-sidebar-foreground/60' />
					)}
				</button>

				<div className='border-t border-sidebar-border p-4'>
					<div className='space-y-3'>
						<TooltipProvider>
							<DropdownMenu>
								<Tooltip>
									<TooltipTrigger asChild>
										<DropdownMenuTrigger asChild>
											<button
												type='button'
												className={cn(
													'flex w-full items-center gap-2 rounded-lg p-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
													isCollapsed && 'justify-center'
												)}
											>
												<ChevronUp className='h-4 w-4' />
												{!isCollapsed && <span>Requil Status</span>}
											</button>
										</DropdownMenuTrigger>
									</TooltipTrigger>
									{isCollapsed && (
										<TooltipContent side='right'>Requil Status</TooltipContent>
									)}
								</Tooltip>
								<DropdownMenuContent
									side='top'
									align='start'
									className='w-56'
								>
									<DropdownMenuItem asChild>
										<Link
											href='/changelog'
											className='flex items-center gap-2 cursor-pointer'
										>
											<FileText className='h-4 w-4' />
											<span>Changelog</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											href='/support'
											className='flex items-center gap-2 cursor-pointer'
										>
											<Headphones className='h-4 w-4' />
											<span>Contact support</span>
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TooltipProvider>
					</div>
				</div>
			</div>
		</aside>
	);
}
