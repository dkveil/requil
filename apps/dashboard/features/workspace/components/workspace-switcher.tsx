'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
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
import { useWorkspace } from '../hooks/use-workspace';

export function WorkspaceSwitcher() {
	const router = useRouter();
	const { workspaces, currentWorkspace } = useWorkspace();

	const handleSwitch = (workspaceSlug: string) => {
		router.push(`/workspace/${workspaceSlug}`);
	};

	if (workspaces.length === 0) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					className='w-[200px] justify-between'
				>
					{currentWorkspace?.name || 'Select Workspace'}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</DropdownMenuTrigger>
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
}
