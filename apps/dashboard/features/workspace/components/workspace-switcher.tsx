'use client';

import { Briefcase, Check, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useWorkspace } from '../hooks/use-workspace';

type Props = {
	isCollapsed?: boolean;
};

export function WorkspaceSwitcher({ isCollapsed = false }: Props) {
	const router = useRouter();
	const { workspaces, currentWorkspace } = useWorkspace();

	const handleSwitch = (workspaceSlug: string) => {
		router.push(`/workspace/${workspaceSlug}`);
	};

	if (workspaces.length === 0) return null;

	const trigger = (
		<Button
			variant='outline'
			role='combobox'
			className={cn(
				'justify-between',
				isCollapsed ? 'h-10 w-10 p-0' : 'w-full'
			)}
		>
			{isCollapsed ? (
				<Briefcase className='h-4 w-4' />
			) : (
				<>
					{currentWorkspace?.name || 'Select Workspace'}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</>
			)}
		</Button>
	);

	const menu = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-[200px]'
			>
				<DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{workspaces.map((workspace) => (
					<DropdownMenuItem
						key={workspace.id}
						onClick={() => handleSwitch(workspace.slug)}
						className='cursor-pointer'
					>
						<Check
							className={`mr-2 h-4 w-4 ${
								currentWorkspace?.id === workspace.id
									? 'opacity-100'
									: 'opacity-0'
							}`}
						/>
						{workspace.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	if (isCollapsed) {
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<div>{menu}</div>
					</TooltipTrigger>
					<TooltipContent side='right'>
						<p className='font-medium'>
							{currentWorkspace?.name || 'Select Workspace'}
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return menu;
}
