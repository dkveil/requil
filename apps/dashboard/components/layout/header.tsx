'use client';

import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { LogOut, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth';
import { LanguageToggle } from './language-toggle';
import { SearchBar } from './search-bar';
import { ModeToggle } from './theme-toggle';

export function Header() {
	const t = useTranslations();
	const router = useRouter();
	const { user, signOut } = useAuthStore();
	const { resolvedTheme } = useTheme();

	const handleSignOut = async () => {
		await signOut();
		router.push(DASHBOARD_ROUTES.AUTH.LOGIN);
	};

	const handleAccountSettings = () => {
		router.push(DASHBOARD_ROUTES.ACCOUNT.SETTINGS);
	};

	const handleNewTemplate = () => {};

	const logoVariant = resolvedTheme === 'dark' ? 'light' : 'dark';

	const getUserInitials = (email?: string) => {
		if (!email) return 'G';
		const parts = email.split('@')[0]?.split('.') || [];
		if (parts.length >= 2 && parts[0] && parts[1]) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return email.substring(0, 2).toUpperCase();
	};

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='flex h-16 items-center justify-between gap-4 px-4'>
				<div className='flex items-center'>
					<Link href={DASHBOARD_ROUTES.HOME}>
						<Logo
							variant={logoVariant}
							width={100}
							height={33}
						/>
					</Link>
				</div>

				<div className='flex-1 max-w-xl'>
					<SearchBar />
				</div>

				{/* Right side actions */}
				<div className='flex items-center gap-2'>
					{/* New + Button with Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='default'
								size='default'
							>
								<Plus className='h-4 w-4' />
								{t('header.new')}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={handleNewTemplate}>
								{t('header.newTemplate')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<ModeToggle iconClassName='h-[1.2rem] w-[1.2rem]' />

					<LanguageToggle iconClassName='h-[1.2rem] w-[1.2rem]' />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='rounded-full'
							>
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
									{getUserInitials(user?.email)}
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='end'
							className='w-56'
						>
							<DropdownMenuLabel>
								<div className='flex flex-col space-y-1'>
									<p className='text-sm font-medium leading-none'>
										{user?.email || t('header.guest')}
									</p>
									{user?.email && (
										<p className='text-xs leading-none text-muted-foreground'>
											{user.email}
										</p>
									)}
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleAccountSettings}>
								<Settings className='mr-2 h-4 w-4' />
								<span>{t('header.accountSettings')}</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleSignOut}>
								<LogOut className='mr-2 h-4 w-4' />
								<span>{t('common.actions.signOut')}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
