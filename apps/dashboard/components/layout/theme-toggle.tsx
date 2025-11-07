'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Props = {
	iconClassName?: string;
};

export function ModeToggle(props: Props) {
	const { setTheme } = useTheme();
	const { iconClassName = 'h-[1.2rem] w-[1.2rem]' } = props;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'
				>
					<Sun
						className={cn(
							'scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90',
							iconClassName
						)}
					/>
					<Moon
						className={cn(
							'absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0',
							iconClassName
						)}
					/>
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
