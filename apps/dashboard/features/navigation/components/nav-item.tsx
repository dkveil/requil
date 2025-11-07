'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Props = {
	icon: LucideIcon;
	label: string;
	href: string;
	description?: string;
	isCollapsed?: boolean;
};

export function NavItem({
	icon: Icon,
	label,
	href,
	description,
	isCollapsed = false,
}: Props) {
	const pathname = usePathname();
	const isActive = pathname === href;

	const linkContent = (
		<Link
			href={href}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
				isActive
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				isCollapsed && 'justify-center p-2'
			)}
		>
			<Icon
				className={cn(
					'h-5 w-5 transition-colors',
					isActive
						? 'text-sidebar-accent-foreground'
						: 'text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground'
				)}
			/>
			{!isCollapsed && <span>{label}</span>}
		</Link>
	);

	if (isCollapsed) {
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
					<TooltipContent
						side='right'
						className='flex flex-col gap-1'
					>
						<p className='font-medium'>{label}</p>
						{description && (
							<p className='text-xs text-gray-500'>{description}</p>
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return linkContent;
}
